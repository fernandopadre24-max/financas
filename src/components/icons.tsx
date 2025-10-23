
import { DollarSign } from 'lucide-react';

export const Icons = {
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full p-2" >
        <DollarSign {...props} />
    </div>
  ),
};
