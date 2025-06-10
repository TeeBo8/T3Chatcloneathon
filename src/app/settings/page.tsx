import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfoPanel } from "@/components/custom/user-info-panel";
import { ModelsSettings } from "@/components/custom/models-settings";
import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-8 p-8 max-w-6xl mx-auto">
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
  );
} 