import { Skeleton } from '../../components/ui/skeleton';
import { Card } from '../../components/ui/card';

const HomeLoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeLoadingSkeleton;
