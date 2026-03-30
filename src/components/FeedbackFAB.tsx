import React, { useState } from 'react';
import { MessageSquarePlus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const FeedbackFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please provide some feedback content.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];

      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { data, error: uploadError } = await supabase.storage
            .from('feedback-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
          
          const { data: publicUrlData } = supabase.storage
            .from('feedback-images')
            .getPublicUrl(data.path);
            
          imageUrls.push(publicUrlData.publicUrl);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('user_feedback').insert({
        content,
        image_url: imageUrls.length > 0 ? imageUrls.join(',') : null,
        user_id: user?.id,
        type: 'feature',
      });

      if (error) throw error;

      toast.success('Feedback submitted successfully!');
      setContent('');
      setFiles([]);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Feedback error:', error);
      toast.error(error.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger render={
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            <MessageSquarePlus className="h-6 w-6" />
          </Button>
        } />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              Report a bug or request a feature to help us improve your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us what's on your mind..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Attach Images (Optional)</Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {files.length > 0 ? `${files.length} images selected` : 'Choose Images'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="text-xs bg-stone-100 px-2 py-1 rounded truncate max-w-[120px]">
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
