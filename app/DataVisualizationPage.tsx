import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
//import { BleManager } from "react-native-ble-plx";
//import { Button } from "../components/Button";  // NativeWind 기반 Button
import { cn } from "../lib/utils";

interface DataPoint {
  time: number;
  resistance: number;
  bpm: number;
}

interface DataVisualizationProps {
  deviceId?: string;
  onBack: () => void;
  isSimulation?: boolean;
}

export default function DataVisualizationPage({ deviceId, onBack, isSimulation = false }: DataVisualizationProps) {
  const [heartRateData, setHeartRateData] = useState<DataPoint[]>([]);
  const [currentBPM, setCurrentBPM] = useState(0);
  const [connected, setConnected] = useState(true);
  const startTime = useRef(Date.now());
  const simulationInterval = useRef<any>(null);

  // ---------------------------
  // 시뮬레이션 모드
  // ---------------------------
  useEffect(() => {
    if (!isSimulation) return;

    simulationInterval.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime.current) / 1000);
      const bpm = 70 + Math.sin(elapsed * 0.3) * 15 + Math.random() * 8;
      const resistance = 1.0 + (bpm / 100) * 2.0;

      setCurrentBPM(Math.round(bpm));
      setHeartRateData(prev => [...prev, { time: elapsed, resistance, bpm }].slice(-50));
    }, 1000);

    return () => clearInterval(simulationInterval.current);
  }, [isSimulation]);

  // ---------------------------
  // BLE 모드
  // ---------------------------


  // ---------------------------
  // UI RENDER
  // ---------------------------
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mx-auto w-full max-w-[360px] bg-white rounded-3xl border-4 border-teal-700 p-6">

        {/* Back button */}
        <Pressable onPress={onBack} className="absolute top-4 left-4 p-2">
          <ChevronLeft size={28} color="#444" />
        </Pressable>

        <View className="mt-8 space-y-4">
          <Text className="text-gray-900 font-bold text-base">
            당신의 건강 상태는...
          </Text>

          <Text className={cn(
            "text-sm",
            connected ? "text-green-600" : "text-red-600"
          )}>
            {connected ? "연결됨 ●" : "연결 끊김 ●"}
          </Text>

          {/* Chart */}
          <View className="bg-white rounded-xl border p-3">
            <Text className="text-xs text-gray-600 mb-1">Resistance vs Time</Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-100 p-3 rounded-lg">
              <Text className="text-xs text-gray-500">데이터 포인트</Text>
              <Text className="text-base">{heartRateData.length}</Text>
            </View>

            <View className="flex-1 bg-gray-100 p-3 rounded-lg">
              <Text className="text-xs text-gray-500">평균 저항</Text>
              <Text className="text-base">
                {heartRateData.length > 0
                  ? (
                      heartRateData.reduce((sum, x) => sum + x.resistance, 0) /
                      heartRateData.length
                    ).toFixed(2)
                  : "0"}
              </Text>
            </View>
          </View>

          {/* Report Button */}
        </View>
      </View>
    </ScrollView>
  );
}
