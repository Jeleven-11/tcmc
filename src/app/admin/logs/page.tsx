"use client";

import React, { useEffect, useState } from "react";
import {
  Timeline,
  Pagination,
  Card,
  Spin,
  Typography,
  Empty,
  DatePicker,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { AssignmentLate } from "@mui/icons-material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

interface Notification {
  notif_title: string;
  notif_description: string;
  notif_timestamp: string;
}

export default function NotificationsLogPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<[Dayjs, Dayjs] | null>([
    dayjs().startOf("day"),
    dayjs().endOf("day"),
  ]);

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

  useEffect(() => {
    if (!selectedDates) return;

    const [start, end] = selectedDates;
    const filtered = notifications.filter((item) => {
      const timestamp = dayjs(item.notif_timestamp);
      return timestamp.isAfter(start) && timestamp.isBefore(end);
    });

    setFilteredNotifications(filtered);
  }, [notifications, selectedDates]);

  return (
    <Card
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AssignmentLate />
          System Notifications Log
        </span>
      }
      extra={
        <DatePicker.RangePicker
          value={selectedDates}
          onChange={(range) => {
            if (range) {
              setSelectedDates([range[0]!.startOf("day"), range[1]!.endOf("day")]);
            } else {
              setSelectedDates(null);
            }
          }}
          style={{ minWidth: 250 }}
          suffixIcon={<CalendarMonthIcon />}
        />
      }
      style={{ margin: 20 }}
    >
      {loading ? (
        <Spin size="large" />
      ) : filteredNotifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="There's no notification today"
        />
      ) : (
        <Timeline mode="left">
          {filteredNotifications.map((item, index) => (
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
