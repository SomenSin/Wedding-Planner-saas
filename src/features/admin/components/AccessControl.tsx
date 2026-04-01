import React, { useState } from 'react';
import { Plus, XCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { AccessCode } from '@/types/admin';

interface AccessControlProps {
  accessCodes: AccessCode[];
  createManualCode: (code: string, eventName: string) => void;
  toggleCodeStatus: (id: string, isActive: boolean) => void;
  deleteCode: (id: string) => void;
}

export const AccessControl: React.FC<AccessControlProps> = ({ 
  accessCodes, 
  createManualCode, 
  toggleCodeStatus, 
  deleteCode 
}) => {
  const [isAddingCode, setIsAddingCode] = useState(false);
  const [newManualCode, setNewManualCode] = useState('');
  const [newEventName, setNewEventName] = useState('');

  const handleCreate = () => {
    createManualCode(newManualCode, newEventName);
    setNewManualCode('');
    setNewEventName('');
    setIsAddingCode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Dialog open={isAddingCode} onOpenChange={setIsAddingCode}>
          <DialogTrigger render={<Button variant="outline" className="rounded-none bg-black text-white hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" /> Create Custom Code
          </Button>} />
          <DialogContent className="rounded-none">
            <DialogHeader>
              <DialogTitle className="font-serif italic text-2xl">Create Access Code</DialogTitle>
              <DialogDescription className="uppercase tracking-widest text-[10px] font-bold">
                Manually define an access code for an upcoming event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 flex flex-col gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Access Code</Label>
                <Input 
                  value={newManualCode} 
                  onChange={(e) => setNewManualCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SMITH2026"
                  className="rounded-none border-stone-200 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Event Name</Label>
                <Input 
                  value={newEventName} 
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g. Sarah & John's Wedding"
                  className="rounded-none border-stone-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-none" onClick={() => setIsAddingCode(false)}>Cancel</Button>
              <Button className="rounded-none bg-black hover:bg-black/90 px-8" onClick={handleCreate}>
                Create Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-none border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Code</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Wedding / Link</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {accessCodes.map((code) => (
              <tr key={code.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xl font-bold tracking-widest">{code.code}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold">{code.event_name || 'Unlinked Code'}</div>
                  <div className="text-[10px] text-stone-400 font-mono italic">ID: {code.linked_user_id || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={code.is_active ? 'default' : 'outline'} className="rounded-none uppercase text-[9px] tracking-widest">
                    {code.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleCodeStatus(code.id, code.is_active)}>
                      {code.is_active ? <XCircle className="h-4 w-4 text-stone-400" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCode(code.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
