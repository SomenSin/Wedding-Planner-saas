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
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please provide some feedback content.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        
        console.log('Attempting to upload feedback image:', fileName);
        const { data, error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw uploadError;
        }
        
        console.log('Upload successful, data:', data);
        
        // Get the full public URL immediately
        const { data: publicRes } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(data.path);
          
        imageUrl = publicRes.publicUrl;
        console.log('Resolved public URL to be saved:', imageUrl);
      }

      const { data: { user } } = await supabase.auth.getUser();

      const insertPayload = {
        content,
        image_url: imageUrl,
        user_id: user?.id,
        type: 'feature',
      };
      
      console.log('Inserting feedback payload:', insertPayload);
      const { error } = await supabase.from('user_feedback').insert(insertPayload);

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      toast.success('Feedback submitted successfully!');
      setContent('');
      setFile(null);
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
              <Label htmlFor="image">Attach Image (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {file ? file.name : 'Choose Image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
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
