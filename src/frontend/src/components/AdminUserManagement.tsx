import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Shield } from 'lucide-react';
import { useAssignAdminRole } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function AdminUserManagement() {
  const [principalInput, setPrincipalInput] = useState('');
  const assignAdminRole = useAssignAdminRole();

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      // Validate principal format
      const principal = Principal.fromText(principalInput.trim());
      
      await assignAdminRole.mutateAsync(principal);
      toast.success('Admin role granted successfully', {
        description: `User ${principalInput.slice(0, 10)}... is now an admin.`,
      });
      setPrincipalInput('');
    } catch (error) {
      console.error('Grant admin error:', error);
      if (error instanceof Error && error.message.includes('Invalid principal')) {
        toast.error('Invalid principal ID', {
          description: 'Please check the principal ID format and try again.',
        });
      } else {
        toast.error('Failed to grant admin role', {
          description: error instanceof Error ? error.message : 'Please try again.',
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Management
        </CardTitle>
        <CardDescription>
          Grant admin privileges to other users by entering their Internet Identity principal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrantAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal">User Principal ID</Label>
            <Input
              id="principal"
              type="text"
              placeholder="Enter Internet Identity principal (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
              value={principalInput}
              onChange={(e) => setPrincipalInput(e.target.value)}
              disabled={assignAdminRole.isPending}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              The user must have logged in at least once to receive admin privileges
            </p>
          </div>
          <Button
            type="submit"
            disabled={assignAdminRole.isPending || !principalInput.trim()}
            className="w-full font-bold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {assignAdminRole.isPending ? 'Granting Admin Role...' : 'Grant Admin Role'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
