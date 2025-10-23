
import { DollarSign } from 'lucide-react';

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full p-1.5" >
        <DollarSign {...props} className="h-5 w-5"/>
    </div>
  ),
};
