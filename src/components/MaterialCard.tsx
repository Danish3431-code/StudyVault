import { Link } from "@tanstack/react-router";
import { FileText, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDate, type Material } from "@/lib/materials";

export function MaterialCard({
  material,
  author,
}: {
  material: Material;
  author?: string | null;
}) {
  const isPublic = material.visibility === "public";
  return (
    <Card className="flex h-full flex-col surface-glass transition-all duration-300 hover:-translate-y-1 hover:glow-neon">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug break-words">{material.title}</h2>
          <Badge variant={isPublic ? "default" : "secondary"} className="shrink-0">
            {isPublic ? (
              <Globe className="mr-1 h-3 w-3" />
            ) : (
              <Lock className="mr-1 h-3 w-3" />
            )}
            {isPublic ? "Public" : "Private"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {material.subject}
          {material.topic ? ` · ${material.topic}` : ""}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <FileText className="h-4 w-4 shrink-0" />
          <span className="uppercase">{material.file_type}</span>
        </p>
        {author ? <p>By {author}</p> : null}
        <p>{formatDate(material.created_at)}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="outline">
          <Link to="/material/$id" params={{ id: material.id }}>
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
