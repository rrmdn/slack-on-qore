import React from "react";
import { css } from "@emotion/css";
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
        margin: 100px auto;
        width: 320px;
      `}
    >
      <Card>
        <Typography.Title level={4}>Register</Typography.Title>
        <Form layout="vertical">
          <Form.Item label="Email">
            <Controller
              name="email"
              control={form.control}
              rules={{ required: true }}
              render={({ value, onChange }) => (
                <Input
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
                  onChange={onChange}
                  type="password"
                  placeholder="Confirm password"
                  value={value}
                />
              )}
            />
          </Form.Item>
        </Form>
        <Form.Item>
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
        </Form.Item>
      </Card>
    </div>
  );
}
