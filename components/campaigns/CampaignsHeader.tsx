'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface CampaignsHeaderProps {
  totalCount: number;
  activeCount: number;
  pausedCount: number;
  completedCount: number;
  draftCount: number;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
}

export default function CampaignsHeader({ 
  totalCount, 
  activeCount, 
  pausedCount, 
  completedCount,
  draftCount,
  currentFilter,
  onFilterChange,
  onSearchChange
}: CampaignsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campagnes</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos campagnes d'engagement Instagram
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une campagne..."
            className="pl-10"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge 
          variant={currentFilter === 'all' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => onFilterChange('all')}
        >
          Toutes ({totalCount})
        </Badge>
        <Badge 
          variant={currentFilter === 'active' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => onFilterChange('active')}
        >
          Actives ({activeCount})
        </Badge>
        <Badge 
          variant={currentFilter === 'paused' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => onFilterChange('paused')}
        >
          En pause ({pausedCount})
        </Badge>
        <Badge 
          variant={currentFilter === 'completed' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => onFilterChange('completed')}
        >
          Terminées ({completedCount})
        </Badge>
        <Badge 
          variant={currentFilter === 'draft' ? 'secondary' : 'outline'}
          className="cursor-pointer"
          onClick={() => onFilterChange('draft')}
        >
          Brouillons ({draftCount})
        </Badge>
      </div>
    </div>
  );
}