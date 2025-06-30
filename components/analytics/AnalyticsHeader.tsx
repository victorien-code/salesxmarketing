import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Filter } from 'lucide-react';

export default function AnalyticsHeader() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analyses</h1>
          <p className="text-muted-foreground">
            Suivez les performances de vos campagnes et optimisez vos résultats
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Derniers 30 jours
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">Vue d'ensemble</Badge>
        <Badge variant="outline">Par campagne</Badge>
        <Badge variant="outline">Par type d'engagement</Badge>
        <Badge variant="outline">Comparaison temporelle</Badge>
      </div>
    </div>
  );
}