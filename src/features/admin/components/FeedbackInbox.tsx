import React, { useState } from 'react';
import { 
  Badge 
} from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Filter, 
  MoreVertical, 
  Eye, 
  ImageIcon, 
  Calendar, 
  User, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Feedback } from '@/types/admin';

interface FeedbackInboxProps {
  feedback: Feedback[];
  updateFeedbackStatus: (id: string, status: string) => void;
}

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({ 
  feedback, 
  updateFeedbackStatus 
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const getImageUrl = (path: string) => {
    return supabase.storage.from('feedback-images').getPublicUrl(path).data.publicUrl;
  };

  const images = selectedFeedback?.image_url ? selectedFeedback.image_url.split(',') : [];

  return (
    <Card className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 bg-muted/50 border-b border-border flex justify-between items-center">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">All Submissions ({feedback.length})</h3>
        <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold rounded-xl hover:bg-accent">
          <Filter className="h-3 w-3 mr-2" /> Filter
        </Button>
      </div>
      <div className="divide-y divide-border">
        {feedback.map((item) => (
          <div key={item.id} className="p-8 hover:bg-accent/30 transition-colors flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant={item.status === 'resolved' ? 'default' : 'outline'} className="rounded-xl uppercase text-[9px] tracking-widest border-none">
                  {item.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-tight line-clamp-1 text-foreground">
                  {item.content.includes('\n') ? item.content.split('\n')[0] : 'No Subject'}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {item.content.includes('\n') ? item.content.split('\n').slice(1).join('\n').trim() : item.content}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                <span>By: {item.users?.email || 'Unknown'}</span>
                {item.image_url && (
                  <span className="flex items-center gap-1 text-primary">
                    <ImageIcon className="h-3 w-3" /> Attachment Included
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="rounded-xl text-[9px] uppercase tracking-widest font-bold border-input hover:bg-accent" />}>
                  Status <MoreVertical className="h-3 w-3 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border bg-card">
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'new')}>Mark as New</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'in-progress')}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'resolved')}>Resolved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl text-[9px] uppercase tracking-widest font-bold hover:bg-accent group/btn"
                onClick={() => setSelectedFeedback(item)}
              >
                <Eye className="h-3 w-3 mr-2" /> View Details <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover/btn:opacity-100 transition-all" />
              </Button>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="p-12 text-center text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
            No feedback submissions found
          </div>
        )}
      </div>
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-4xl rounded-3xl border border-border bg-card p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-4 mb-2">
              <Badge variant={selectedFeedback?.status === 'resolved' ? 'default' : 'outline'} className="rounded-xl uppercase text-[10px] tracking-widest border-none">
                {selectedFeedback?.status}
              </Badge>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <Calendar className="h-3 w-3" />
                {selectedFeedback && new Date(selectedFeedback.created_at).toLocaleString()}
              </div>
            </div>
            <DialogTitle className="font-serif italic text-3xl text-foreground">
              {selectedFeedback?.content.split('\n')[0] || 'Feedback Submission'}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <User className="h-4 w-4" /> Reported By
              </div>
              <div className="text-sm font-mono bg-muted p-3 rounded-xl border border-border">
                {selectedFeedback?.users?.email || 'Unknown User'}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message Body</h4>
              <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-background p-6 rounded-2xl border border-border">
                {selectedFeedback?.content.includes('\n') 
                  ? selectedFeedback.content.split('\n').slice(1).join('\n').trim() 
                  : selectedFeedback?.content}
              </div>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Attachments ({images.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((path, idx) => (
                    <div key={idx} className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted">
                      <img 
                        src={getImageUrl(path)} 
                        alt={`Attachment ${idx + 1}`} 
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <a 
                          href={getImageUrl(path)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-white/90 text-black px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> View Full Size
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {images.length === 0 && selectedFeedback?.image_url && (
              <div className="p-8 text-center border-2 border-dashed border-border rounded-3xl text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Image metadata exists but could not be parsed</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-muted/30 border-t border-border flex justify-between items-center">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="rounded-xl text-[10px] uppercase tracking-widest font-bold border-input bg-card shadow-sm" />}>
                  Set Status <MoreVertical className="h-3 w-3 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="rounded-xl border-border bg-card">
                  <DropdownMenuItem onClick={() => {
                    if (selectedFeedback) {
                      updateFeedbackStatus(selectedFeedback.id, 'new');
                      setSelectedFeedback({ ...selectedFeedback, status: 'new' });
                    }
                  }}>
                    Mark as New
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (selectedFeedback) {
                      updateFeedbackStatus(selectedFeedback.id, 'in-progress');
                      setSelectedFeedback({ ...selectedFeedback, status: 'in-progress' });
                    }
                  }}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (selectedFeedback) {
                      updateFeedbackStatus(selectedFeedback.id, 'resolved');
                      setSelectedFeedback({ ...selectedFeedback, status: 'resolved' });
                    }
                  }}>
                    Resolved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button 
              className="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]"
              onClick={() => setSelectedFeedback(null)}
            >
              Close Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
