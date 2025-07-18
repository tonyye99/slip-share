import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4">Receipt Scanner</h1>
          <p className="text-xl text-muted-foreground">Upload and scan your receipts with OCR</p>
          <Button asChild size="lg">
            <Link to="/upload-receipt">Upload Receipt</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
