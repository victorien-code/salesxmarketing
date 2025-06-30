'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MoreHorizontal,
  Image as ImageIcon,
  Video,
  Grid3X3,
  Zap,
  Edit,
  Copy,
  Send,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScheduledPost, PostType } from '@/lib/scheduling';

interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePicture?: string;
  accountType?: string;
}

interface ContentCalendarViewProps {
  posts: ScheduledPost[];
  onEditPost: (post: ScheduledPost) => void;
  onDeletePost: (postId: string) => void;
  onDuplicatePost: (post: ScheduledPost) => void;
  onPublishPost: (postId: string) => void;
  getAccountInfo: (accountId: string) => InstagramAccount | undefined;
}

export default function ContentCalendarView({
  posts,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onPublishPost,
  getAccountInfo
}: ContentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Obtenir le premier jour du mois et le nombre de jours
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Générer les jours du calendrier
  const calendarDays = [];
  
  // Jours vides au début
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Jours du mois
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Grouper les posts par jour
  const postsByDay = posts.reduce((acc, post) => {
    const postDate = new Date(post.scheduledDate);
    if (
      postDate.getFullYear() === currentDate.getFullYear() &&
      postDate.getMonth() === currentDate.getMonth()
    ) {
      const day = postDate.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(post);
    }
    return acc;
  }, {} as Record<number, ScheduledPost[]>);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: PostType) => {
    const icons = {
      image: ImageIcon,
      video: Video,
      carousel: Grid3X3,
      story: Zap,
    };
    return icons[type] || ImageIcon;
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="space-y-6">
      {/* Header du calendrier */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" onClick={goToToday}>
              <Calendar className="h-4 w-4 mr-2" />
              Aujourd'hui
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grille du calendrier */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map(day => (
              <div key={day} className="p-4 text-center font-medium text-sm bg-muted/50">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const isToday = day && 
                new Date().getDate() === day &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();
              
              const dayPosts = day ? postsByDay[day] || [] : [];
              
              return (
                <div 
                  key={index} 
                  className={`min-h-[120px] border-r border-b p-2 ${
                    !day ? 'bg-muted/20' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : ''
                      }`}>
                        {day}
                        {isToday && (
                          <Badge variant="default" className="ml-1 text-xs">
                            Aujourd'hui
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayPosts.slice(0, 3).map(post => {
                          const TypeIcon = getTypeIcon(post.type);
                          const account = getAccountInfo(post.instagramAccountId);
                          
                          return (
                            <div 
                              key={post.id}
                              className="group relative"
                            >
                              <div className={`p-2 rounded text-xs border cursor-pointer hover:shadow-sm transition-shadow ${getStatusBadge(post.status)}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center space-x-1">
                                    <TypeIcon className="h-3 w-3" />
                                    <span className="font-medium truncate">
                                      {post.title}
                                    </span>
                                  </div>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreHorizontal className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => onEditPost(post)}>
                                        <Edit className="mr-2 h-3 w-3" />
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onDuplicatePost(post)}>
                                        <Copy className="mr-2 h-3 w-3" />
                                        Dupliquer
                                      </DropdownMenuItem>
                                      {post.status === 'scheduled' && (
                                        <DropdownMenuItem onClick={() => onPublishPost(post.id)}>
                                          <Send className="mr-2 h-3 w-3" />
                                          Publier maintenant
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => onDeletePost(post.id)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(post.scheduledDate).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  
                                  {account && (
                                    <Avatar className="h-4 w-4">
                                      <AvatarImage src={account.profilePicture || ''} />
                                      <AvatarFallback className="text-xs">
                                        {account.username.substring(0, 1).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {dayPosts.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{dayPosts.length - 3} autres
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Légende */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Légende</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-gray-100"></div>
                <span className="text-sm">Brouillon</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-100"></div>
                <span className="text-sm">Planifié</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-100"></div>
                <span className="text-sm">Publié</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-red-100"></div>
                <span className="text-sm">Échec</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}