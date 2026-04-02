import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Filter, MoreVertical, Eye, ImageIcon } from 'lucide-react';
import { Feedback } from '@/types/admin';

interface FeedbackInboxProps {
  feedback: Feedback[];
  updateFeedbackStatus: (id: string, status: string) => void;
}

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({ 
  feedback, 
  updateFeedbackStatus 
}) => {
  return (
    <Card className="rounded-none border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden dark:bg-zinc-900 transition-colors">
      <div className="p-4 bg-stone-50 dark:bg-zinc-800/50 border-b border-stone-200 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 dark:text-zinc-400">All Submissions ({feedback.length})</h3>
        <Button variant="ghost" size="sm" className="text-[10px] uppercase tracking-widest font-bold dark:text-zinc-400 dark:hover:text-white">
          <Filter className="h-3 w-3 mr-2" /> Filter
        </Button>
      </div>
      <div className="divide-y divide-stone-100 dark:divide-zinc-800">
        {feedback.map((item) => (
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
            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="rounded-none text-[9px] uppercase tracking-widest font-bold dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800" />}>
                  Status <MoreVertical className="h-3 w-3 ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none dark:bg-zinc-900 dark:border-zinc-800">
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'new')}>Mark as New</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'in-progress')}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateFeedbackStatus(item.id, 'resolved')}>Resolved</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="rounded-none text-[9px] uppercase tracking-widest font-bold dark:text-zinc-400 dark:hover:text-white">
                <Eye className="h-3 w-3 mr-2" /> View Details
              </Button>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <div className="p-12 text-center text-stone-400 dark:text-zinc-600 uppercase tracking-widest text-[10px] font-bold">
            No feedback submissions found
          </div>
        )}
      </div>
    </Card>
  );
};
