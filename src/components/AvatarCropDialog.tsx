import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

const VIEW = 288; // px, on-screen crop viewport (square)
const OUTPUT = 512; // px, exported avatar size

type Props = {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onCropped: (blob: Blob) => Promise<void> | void;
};

export function AvatarCropDialog({ file, open, onCancel, onCropped }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      setImg(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Base scale so the image always covers the square viewport.
  const rotated = rotation % 180 !== 0;
  const naturalW = img ? (rotated ? img.naturalHeight : img.naturalWidth) : 1;
  const naturalH = img ? (rotated ? img.naturalWidth : img.naturalHeight) : 1;
  const baseScale = img ? Math.max(VIEW / naturalW, VIEW / naturalH) : 1;
  const scale = baseScale * zoom;

  const clamp = useCallback(
    (next: { x: number; y: number }) => {
      const maxX = Math.max(0, (naturalW * scale - VIEW) / 2);
      const maxY = Math.max(0, (naturalH * scale - VIEW) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [naturalW, naturalH, scale],
  );

  useEffect(() => {
    setOffset((o) => clamp(o));
  }, [clamp]);

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  async function handleSave() {
    if (!img) return;
    setSaving(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const ratio = OUTPUT / VIEW;
      ctx.imageSmoothingQuality = "high";
      ctx.translate(OUTPUT / 2 + offset.x * ratio, OUTPUT / 2 + offset.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale * ratio, scale * ratio);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("Could not process image");
      await onCropped(blob);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !saving && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
          <DialogDescription>
            Drag to reposition, then zoom or rotate until it looks right.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          <div
            className="relative touch-none overflow-hidden rounded-full border-2 border-primary/60 bg-muted"
            style={{ width: VIEW, height: VIEW, cursor: dragRef.current ? "grabbing" : "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {src && (
              <img
                src={src}
                alt="Adjust profile preview"
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
                  transformOrigin: "center",
                  width: img?.naturalWidth,
                  height: img?.naturalHeight,
                }}
              />
            )}
          </div>

          <div className="flex w-full items-center gap-3">
            <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              aria-label="Zoom"
              min={1}
              max={4}
              step={0.01}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v ?? 1)}
            />
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRotation((r) => (r + 90) % 360)}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" disabled={saving} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={saving || !img} onClick={handleSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
