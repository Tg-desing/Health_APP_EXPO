import { Buffer } from "buffer";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BleError, BleManager, Device, Subscription } from "react-native-ble-plx";
import { LineChart } from "react-native-gifted-charts";
import { cn } from "../lib/utils";

const SERVICE_UUID = "19B10010-E8F2-537E-4F6C-D104768A1214";
const VOLT_CHAR_UUID = "19B10012-E8F2-537E-4F6C-D104768A1214"; 

interface DataPoint {
  value: number; 
  label?: string;
}

interface DataVisualizationProps {
  device?: Device | null; 
  deviceId?: string; 
  onBack: () => void;
  isSimulation?: boolean;
}

const decodeBase64 = (str: string) => {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch (e) {
    return ""; 
  }
};

// 딜레이 주는 함수 (안전장치)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function DataVisualizationPage({ 
  device, 
  deviceId,
  onBack, 
  isSimulation = false 
}: DataVisualizationProps) {
  
  const [voltageData, setVoltageData] = useState<DataPoint[]>(Array(30).fill({ value: 0 }));
  const [currentVoltage, setCurrentVoltage] = useState(0);
  const [connected, setConnected] = useState(false);
  const [foundDevice, setFoundDevice] = useState<Device | null>(device || null);
  const [statusText, setStatusText] = useState("준비 중...");
  
  const latestVoltageRef = useRef<number>(0);
  const manager = useMemo(() => new BleManager(), []);
  const subscriptionRef = useRef<Subscription | null>(null);

  // 1. 디바이스 찾기 (스캔)
  useEffect(() => {
    if (isSimulation || !deviceId || device) return;

    const findDevice = async () => {
      try {
        setStatusText("기기 찾는 중...");
        // 혹시 켜져있을 스캔 중지
        await manager.stopDeviceScan(); 
        
        manager.startDeviceScan(null, { allowDuplicates: false }, (error, scannedDevice) => {
          if (error) {
            console.log("Scan Error:", error);
            return;
          }

          if (scannedDevice && scannedDevice.id === deviceId) {
            console.log("🔍 기기 발견!");
            manager.stopDeviceScan(); // 찾자마자 스캔 중지
            setFoundDevice(scannedDevice);
          }
        });

        // 5초 못 찾으면 타임아웃
        setTimeout(async () => {
           await manager.stopDeviceScan();
        }, 5000);
      } catch (error) {
        console.log("Find Device Error:", error);
      }
    };

    findDevice();
  }, [deviceId, device, isSimulation, manager]);

  // 2. BLE 연결 및 모니터링
  useEffect(() => {
    if (isSimulation) return;

    const connectAndMonitor = async () => {
      const targetDevice = device || foundDevice;
      if (!targetDevice) return;

      try {
        setStatusText("연결 시도 중...");
        
        // ⚠️ [핵심 수정] Unknown Error 방지: 연결 전 스캔 확실히 끄고 0.5초 대기
        manager.stopDeviceScan();
        await delay(500); 

        const isConnected = await targetDevice.isConnected();
        let connectedDevice = targetDevice;
        
        if (!isConnected) {
          try {
            connectedDevice = await targetDevice.connect();
          } catch (connectError: any) {
            // 만약 Unknown Error가 뜨면 1초 쉬고 딱 한번만 재시도
            console.log("⚠️ 1차 연결 실패, 재시도...", connectError);
            await delay(1000);
            connectedDevice = await targetDevice.connect();
          }
        }
        
        setConnected(true);
        setStatusText("서비스 탐색 중...");
        await connectedDevice.discoverAllServicesAndCharacteristics();

        setStatusText("데이터 수신 중");
        
        subscriptionRef.current = connectedDevice.monitorCharacteristicForService(
          SERVICE_UUID,
          VOLT_CHAR_UUID,
          (error: BleError | null, characteristic: any) => {
            if (error) {
               // 뒤로가기 등 취소 에러는 무시
               if (error.errorCode === 201 || error.message?.includes("cancelled")) return;
               console.log("Monitor Error:", error);
               return;
            }

            if (characteristic?.value) {
              const decodedString = decodeBase64(characteristic.value); 
              const voltage = parseFloat(decodedString);
              if (!isNaN(voltage)) {
                latestVoltageRef.current = voltage;
              }
            }
          }
        );

      } catch (error) {
        console.log("Connection Error:", error);
        setStatusText("연결 실패");
        setConnected(false);
        // Alert.alert("오류", "연결에 실패했습니다. 다시 시도해주세요.");
      }
    };

    connectAndMonitor();

    // Cleanup
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [foundDevice, device, isSimulation]); // foundDevice가 세팅되면 실행됨

  // 3. 매니저 정리
  useEffect(() => {
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, [manager]);

  // 4. 화면 갱신 루프
  useEffect(() => {
    const renderInterval = setInterval(() => {
      let newValue = latestVoltageRef.current;

      if (isSimulation) {
        newValue = 1.5 + Math.sin(Date.now() / 500) * 0.5 + Math.random() * 0.1;
        latestVoltageRef.current = newValue;
      }

      setCurrentVoltage(newValue);
      setVoltageData((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].value === newValue) return prev;
        const newData = [...prev, { value: newValue }];
        if (newData.length > 30) newData.shift();
        return newData;
      });
    }, 100);

    return () => clearInterval(renderInterval);
  }, [isSimulation]);

  // UI RENDER
  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="mx-auto w-full max-w-[360px] bg-white rounded-3xl border-4 border-teal-700 p-6">

        <Pressable onPress={onBack} className="absolute top-4 left-4 p-2 z-10">
          <ChevronLeft size={28} color="#444" />
        </Pressable>

        <View className="mt-8 space-y-4">
          <Text className="text-gray-900 font-bold text-base text-center">
            실시간 전압 측정
          </Text>

          <View className="flex-row justify-center items-center gap-2">
            <Text className={cn(
              "text-sm font-bold",
              connected || isSimulation ? "text-green-600" : "text-gray-500"
            )}>
              {isSimulation ? "● 시뮬레이션" : `● ${statusText}`}
            </Text>
          </View>

          <View className="bg-white rounded-xl border border-gray-200 p-2 overflow-hidden items-center justify-center">
             <Text className="text-xs text-gray-500 mb-2 self-start ml-2">Voltage (V)</Text>
             <LineChart
                data={voltageData}
                height={200}
                width={260}
                maxValue={3.3} 
                initialSpacing={0}
                spacing={10}
                color="#0d9488" 
                thickness={3}
                hideDataPoints
                hideRules
                yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                xAxisColor="transparent"
                yAxisColor="transparent"
                curved 
                isAnimated={false} 
              />
          </View>

          <View className="flex-row gap-3 mt-2">
            <View className="flex-1 bg-teal-50 p-4 rounded-xl items-center justify-center border border-teal-100">
              <Text className="text-sm text-teal-600 mb-1">현재 전압</Text>
              <Text className="text-3xl font-extrabold text-teal-800">
                {currentVoltage.toFixed(4)}
                <Text className="text-sm font-normal text-teal-600"> V</Text>
              </Text>
            </View>
          </View>

          <View className="bg-gray-100 p-3 rounded-lg mt-2">
             <Text className="text-xs text-gray-500 text-center">
                UUID: {SERVICE_UUID.slice(0, 8)}...
             </Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}