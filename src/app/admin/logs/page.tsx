// app/notifications/page.tsx or pages/notifications.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Timeline, Pagination, Card, Spin, Typography } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

interface Notification {
  notif_title: string;
  notif_description: string;
  notif_timestamp: string;
}

export default function NotificationsLogPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/notifications/Logs?page=${pageNum}&pageSize=${pageSize}`);

      setNotifications(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  return (
    <Card title="📋 System Notifications Log" style={{ margin: 20 }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Timeline mode="left">
          {notifications.map((item, index) => (
            <Timeline.Item
              key={index}
              label={dayjs(item.notif_timestamp).format("YYYY-MM-DD")}
              dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
            >
              <Typography.Text strong>{item.notif_title}</Typography.Text>
              <br />
              <Typography.Text>{item.notif_description}</Typography.Text>
              <br />
              <Typography.Text type="secondary">
                {dayjs(item.notif_timestamp).format("hh:mm A")}
              </Typography.Text>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(p) => setPage(p)}
        />
      </div>
    </Card>
  );
}
