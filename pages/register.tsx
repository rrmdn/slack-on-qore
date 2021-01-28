import React from "react";
import { css } from "@emotion/css";
import { KeyOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Space, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";

export default function Register() {
  const form = useForm<{
    email: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });
  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    error?: Error;
  }>({ status: "idle" });
  const router = useRouter();
  const handleSubmit = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const { email, password } = form.getValues();
      setState({ status: "loading" });
      try {
        await axios.post("/api/register", { email, password });
        message.success("Registered, please login");
        router.push("/login", "/login");
      } catch (error) {
        setState({ status: "error", error });
        message.error(error.message);
      }
    },
    []
  );
  return (
    <div
      className={css`
        display: flex;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        justify-content: center;
        align-items: center;
        background: rgba(98, 35, 41, 1);
        background: linear-gradient(
          327deg,
          rgba(0, 0, 0, 1) 0%,
          rgba(43, 21, 21, 1) 34%,
          rgba(98, 35, 41, 1) 68%,
          rgba(223, 69, 85, 1) 100%
        );
      `}
    >
      <Card
        className={css`
          width: 420px;
          box-shadow: 0 0px 9px 5px rgb(0 0 0 / 15%);
        `}
      >
        <Typography.Title level={4}>Register to Slack on Qore</Typography.Title>
        <Form layout="vertical">
          <Form.Item label="Email">
            <Controller
              name="email"
              control={form.control}
              rules={{ required: true }}
              render={({ value, onChange }) => (
                <Input
                  prefix={<MailOutlined />}
                  onChange={onChange}
                  placeholder="Email here"
                  value={value}
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Password">
            <Controller
              name="password"
              control={form.control}
              rules={{
                required: true,
              }}
              render={({ value, onChange }) => (
                <Input
                  prefix={<KeyOutlined />}
                  onChange={onChange}
                  type="password"
                  placeholder="Password here"
                  value={value}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label="Confirm password"
            hasFeedback={!!form.errors.confirmPassword}
            help={form.errors.confirmPassword?.message}
            validateStatus={form.errors.confirmPassword ? "error" : undefined}
          >
            <Controller
              name="confirmPassword"
              control={form.control}
              rules={{
                required: true,
                validate: (value) => {
                  if (value !== form.getValues().password)
                    return "Passwords do not match";
                },
              }}
              render={({ value, onChange }) => (
                <Input
                  prefix={<KeyOutlined />}
                  onChange={onChange}
                  type="password"
                  placeholder="Confirm password"
                  value={value}
                />
              )}
            />
          </Form.Item>
        </Form>
        <Space>
          <Button
            disabled={!form.formState.isValid || state.status === "loading"}
            onClick={handleSubmit}
            type="primary"
          >
            {state.status === "loading" ? "Registering.." : "Register"}
          </Button>
          <Link href="/login" as="/login">
            <Button>Login</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
