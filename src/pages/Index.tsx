import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to Admin Panel</h1>
        <p className="mb-8 text-xl text-muted-foreground">Manage your store efficiently</p>
        <Button onClick={() => navigate("/admin")} size="lg">
          Go to Admin Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Index;
