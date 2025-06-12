import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfoPanel } from "@/components/custom/user-info-panel";
import { ModelsSettings } from "@/components/custom/models-settings";
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-8">Settings</h1>
      
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Colonne de Gauche */}
        <UserInfoPanel />

        {/* Colonne de Droite avec les Onglets */}
        <div className="w-full">
          <Tabs defaultValue="account">
            <TabsList className="mb-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              {/* On intègre directement le composant Clerk ici */}
              <UserProfile routing="hash" />
            </TabsContent>

            <TabsContent value="models">
              <ModelsSettings />
            </TabsContent>
            
            <TabsContent value="billing">
              {/* Placeholder pour la facturation */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
} 