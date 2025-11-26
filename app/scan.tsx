import { Stack, router } from "expo-router";
import { BLEScanPage } from "../components/BLEScanPage";

export default function ScanPage() {
  return (
    <>
      {/* Header 제거 */}
      <Stack.Screen options={{ headerShown: false }} />

      <BLEScanPage
        onBack={() => router.back()}
        onSimulationConnect={() => router.push("./data")}
      />
    </>
  );
}
