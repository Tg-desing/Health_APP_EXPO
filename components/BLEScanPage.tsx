import {
    ChevronLeft,
    RefreshCw,
    SignalHigh,
    SignalLow,
    SignalMedium,
    Smartphone,
    Wifi,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../app/Button";

interface BLEScanPageProps {
  onBack: () => void;
  onSimulationConnect: () => void;
}

const dummyDevices = [
  { id: "1", name: "등록 안된 기기 1", rssi: -45 },
  { id: "2", name: "등록 안된 기기 2", rssi: -65 },
];

function getSignalStrength(rssi: number) {
  if (rssi >= -50) return 4;
  if (rssi >= -60) return 3;
  if (rssi >= -70) return 2;
  return 1;
}

function SignalIcon({ strength }: { strength: number }) {
  if (strength === 4) return <SignalHigh size={22} color="#2563eb" />;
  if (strength === 3) return <SignalHigh size={22} color="#2563eb" />;
  if (strength === 2) return <SignalMedium size={22} color="#2563eb" />;
  return <SignalLow size={22} color="#94a3b8" />;
}

export function BLEScanPage({ onBack, onSimulationConnect }: BLEScanPageProps) {
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
  };

  useEffect(() => {
    handleScan();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-4">
      {/* ⭐ StartPage와 동일한 width 래퍼 */}
      <View className="w-full max-w-[360px]">

        {/* ⭐ StartPage와 똑같은 카드 구조 — flex-1 절대 넣지 말 것 */}
        <View className="bg-white rounded-[32px] border-4 border-teal-700 shadow-2xl p-8 relative">

          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            onPress={onBack}
            className="absolute top-6 left-6 p-2"
          >
            <ChevronLeft size={28} color="#444" />
          </TouchableOpacity>

          {/* 카드 내부 콘텐츠 — StartPage처럼 h-full + justify-center 사용 */}
          <View className="w-full h-full flex flex-col justify-center">

            {/* 상단 아이콘 */}
            <View className="items-center py-4">
              <Wifi size={80} color="#2563eb" strokeWidth={2} />
            </View>

            <Text className="text-center text-gray-900 font-bold text-base mb-4">
              기기 탐색중...
            </Text>

            {/* 디바이스 목록 */}
            <ScrollView className="mb-4" contentContainerStyle={{ paddingBottom: 12 }}>
              {dummyDevices.map((d) => {
                const strength = getSignalStrength(d.rssi);
                return (
                  <TouchableOpacity
                    key={d.id}
                    onPress={onSimulationConnect}
                    className="flex-row items-center justify-between border-2 border-black rounded-2xl p-4 mb-3 bg-white"
                  >
                    <View className="flex-row items-center gap-3">
                      <Smartphone size={24} color="#000" />
                      <View>
                        <Text className="text-gray-900 font-semibold">
                          {d.name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          RSSI: {d.rssi} dBm
                        </Text>
                      </View>
                    </View>

                    <SignalIcon strength={strength} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 하단 버튼도 StartPage와 동일한 구조 */}
            <Button
              onPress={handleScan}
              variant="outline"
              className="w-full rounded-xl h-12 border-2 border-gray-400"
              disabled={isScanning}
            >
              <RefreshCw size={16} color="#444" className={isScanning ? "animate-spin" : ""} />
              <Text className="ml-2">재탐색</Text>
            </Button>

          </View>
        </View>
      </View>
    </View>
  );
}
