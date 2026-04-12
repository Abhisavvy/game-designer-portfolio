'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, GitBranch, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface GitStatus {
  hasChanges: boolean;
  files: string[];
}

interface DeploymentStatusProps {
  className?: string;
}

export function DeploymentStatus({ className }: DeploymentStatusProps) {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [lastDeployment, setLastDeployment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchGitStatus = async () => {
    try {
      const response = await fetch('/api/admin/deploy');
      const data = await response.json();
      
      if (data.success) {
        setGitStatus(data.gitStatus);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch git status');
      }
    } catch (err) {
      setError('Failed to fetch git status');
      console.error('Git status error:', err);
    }
  };

  const triggerManualDeployment = async () => {
    setIsDeploying(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Manual deployment from admin panel' }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastDeployment(data.timestamp);
        await fetchGitStatus(); // Refresh status
      } else {
        setError(data.error || 'Deployment failed');
      }
    } catch (err) {
      setError('Deployment failed');
      console.error('Deployment error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  useEffect(() => {
    fetchGitStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchGitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Deployment Status
        </CardTitle>
        <CardDescription>
          Monitor and deploy changes to your Vercel site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {gitStatus && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Git Status:</span>
              <Badge variant={gitStatus.hasChanges ? "destructive" : "secondary"}>
                {gitStatus.hasChanges ? `${gitStatus.files.length} changes` : 'Up to date'}
              </Badge>
            </div>
            
            {gitStatus.hasChanges && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Changed files:</span>
                <div className="max-h-32 overflow-y-auto">
                  {gitStatus.files.map((file, index) => (
                    <div key={index} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {file}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {lastDeployment && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Last deployed: {new Date(lastDeployment).toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={triggerManualDeployment}
            disabled={isDeploying || !gitStatus?.hasChanges}
            className="flex items-center gap-2"
          >
            {isDeploying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isDeploying ? 'Deploying...' : 'Deploy Now'}
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchGitStatus}
            disabled={isDeploying}
            className="flex items-center gap-2"
          >
            <GitBranch className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Changes are automatically deployed when you save content in the admin panel.
        </div>
      </CardContent>
    </Card>
  );
}