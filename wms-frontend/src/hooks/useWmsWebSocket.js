import { useEffect, useRef } from 'react';

export const useWmsWebSocket = (clientId, onMessageReceived) => {
  const wsRef = useRef(null);
  const callbackRef = useRef(onMessageReceived);

  // 始终保持回调函数是最新的，而不触发 WebSocket 重连
  useEffect(() => {
    callbackRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    // 连接到 Spring Boot 后端的 WebSocket 端点
    // 动态获取当前 IP，适配手机端通过局域网连接 WebSocket
    const wsUrl = `ws://${window.location.hostname}:8081/ws/scan?clientId=${clientId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log(`已连接到扫码中继服务 (Client: ${clientId})`);
    };

    wsRef.current.onmessage = (event) => {
      if (callbackRef.current) {
        callbackRef.current(event.data);
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [clientId]);
};
