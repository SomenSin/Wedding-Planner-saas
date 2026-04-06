import React, { useState, useEffect } from 'react';
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
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, MoreVertical, Eye, ImageIcon, X, ExternalLink, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Feedback } from '@/types/admin';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FeedbackInboxProps {
  feedback: Feedback[];
  updateFeedbackStatus: (id: string, status: string) => void;
  deleteFeedback: (id: string, imageUrl?: string | null) => Promise<void>;
}

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({ 
  feedback, 
  updateFeedbackStatus,
  deleteFeedback
}) => {
  const [selectedItem, setSelectedItem] = useState<Feedback | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const resolveImage = async () => {
      if (selectedItem?.image_url) {
        if (selectedItem.image_url.startsWith('http')) {
          setResolvedImageUrl(selectedItem.image_url);
        } else {
          try {
            // Use signed URL for better reliable loading even if bucket is private
            const { data, error } = await supabase.storage
              .from('feedback-images')
              .createSignedUrl(selectedItem.image_url, 3600); // 1hr
            
            if (error) {
              console.warn('Could not create signed URL, trying public URL fallback:', error);
              const { data: publicData } = supabase.storage.from('feedback-images').getPublicUrl(selectedItem.image_url);
              setResolvedImageUrl(publicData.publicUrl);
            } else {
              setResolvedImageUrl(data.signedUrl);
            }
          } catch (err) {
            console.error('Resolved image error:', err);
            setResolvedImageUrl(null);
          }
        }
      } else {
        setResolvedImageUrl(null);
      }
    };

    resolveImage();
  }, [selectedItem]);

  const filteredFeedback = feedback.filter(item => 
    statusFilter === 'all' ? true : item.status === statusFilter
  );

  const handleDelete = async (item: Feedback) => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
    
    setIsDeleting(true);
    try {
      await deleteFeedback(item.id, item.image_url);
      if (selectedItem?.id === item.id) setSelectedItem(null);
      toast.success('Feedback deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-none border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden dark:bg-zinc-900 transition-colors">
        <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 border-b border-stone-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">All Submissions ({filteredFeedback.length})</h3>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2 py-1 border border-stone-200 dark:border-zinc-700">
               <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Filter:</span>
               <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[9px] uppercase tracking-widest font-bold focus:ring-0 cursor-pointer dark:text-zinc-300 outline-none"
               >
                 <option value="all">All</option>
                 <option value="new">New</option>
                 <option value="in-progress">In-Progress</option>
                 <option value="resolved">Resolved</option>
               </select>
            </div>
          </div>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-zinc-800">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="p-6 hover:bg-stone-50/50 dark:hover:bg-zinc-800/50 transition-colors flex gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant={item.status === 'resolved' ? 'default' : 'outline'} className="rounded-none uppercase text-[9px] tracking-widest">
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-tight line-clamp-1 dark:text-white">{item.content.split('\n')[0]}</p>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{item.content.split('\n').slice(1).join('\n').trim()}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 dark:text-zinc-500">
                  <span>By: {item.users?.email || 'Unknown'}</span>
                  {item.image_url && (
                    <span className="flex items-center gap-1 text-black dark:text-zinc-300">
                      <ImageIcon className="h-3 w-3" /> Attachment Included
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="rounded-none text-[9px] uppercase tracking-widest font-bold dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 w-full" />}>
                    Status <MoreVertical className="h-3 w-3 ml-2" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none dark:bg-zinc-900 dark:border-zinc-800">
                    <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'new')}>Mark as New</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'in-progress')}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'resolved')}>Resolved</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 rounded-none text-[9px] uppercase tracking-widest font-bold dark:text-zinc-400 dark:hover:text-white border border-stone-100 dark:border-zinc-800"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Eye className="h-3 w-3 mr-2" /> View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-none text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2"
                    onClick={() => handleDelete(item)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {filteredFeedback.length === 0 && (
            <div className="p-12 text-center text-stone-400 dark:text-zinc-600 uppercase tracking-widest text-[10px] font-bold">
              No feedback submissions match your filter
            </div>
          )}
        </div>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-2xl rounded-none dark:bg-zinc-950 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl dark:text-white">Feedback Details</DialogTitle>
            <DialogDescription className="uppercase tracking-widest text-[10px] font-bold dark:text-zinc-500">
              Submitted by {selectedItem?.users?.email || 'Anonymous'} on {selectedItem && new Date(selectedItem.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6 pt-4">
              <div className="p-4 bg-stone-50 dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800">
                <p className="text-sm leading-relaxed whitespace-pre-wrap dark:text-zinc-300">
                  {selectedItem.content}
                </p>
              </div>

              {selectedItem.image_url && (
                <div className="space-y-3">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Attached Image</Label>
                  <div className="relative group min-h-[100px] border border-stone-200 dark:border-zinc-800 bg-stone-100/50 dark:bg-zinc-900/50 flex items-center justify-center">
                    {resolvedImageUrl ? (
                      <>
                        <img 
                          src={resolvedImageUrl} 
                          alt="Feedback attachment" 
                          className="w-full max-h-[400px] object-contain bg-white dark:bg-zinc-900"
                          onError={() => {
                            console.error('Failed to load image:', resolvedImageUrl);
                            setResolvedImageUrl(null);
                          }}
                        />
                        <a 
                          href={resolvedImageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink className="h-3 w-3" /> Open Full Image
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-stone-400 py-12">
                        <AlertCircle className="h-6 w-6" />
                        <span className="text-[9px] uppercase tracking-widest font-bold">Image failed to load or is syncing...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-6 border-t border-stone-100 dark:border-zinc-800">
                <Button 
                  variant="outline" 
                  className="rounded-none dark:border-zinc-800 dark:text-zinc-400" 
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
                {selectedItem.status !== 'resolved' && (
                  <Button 
                    className="rounded-none bg-black dark:bg-white text-white dark:text-zinc-900 hover:bg-black/90 dark:hover:bg-zinc-100 border border-black dark:border-white"
                    onClick={() => {
                      updateFeedbackStatus(selectedItem.id, 'resolved');
                      setSelectedItem(null);
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
