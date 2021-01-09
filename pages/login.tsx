import React from "react";
import Cookies from "js-cookie";
import { css } from "@emotion/css";
import { Button, Card, Form, Input, message, Space, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { client } from "../qoreContext";
import Link from "next/link";

export default function Login() {
  const form = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });
  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    error?: Error;
  }>({ status: "idle" });
  const router = useRouter();
  const handleSubmit = React.useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      const values = form.getValues();
      setState({ status: "loading" });
      try {
        const token = await client.authenticate(values.email, values.password);
        Cookies.set("token", token, { path: "/" });
        setState({ status: "success" });
        message.success("Logged in");
        router.push("/", "/");
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
        <Typography.Title level={4}>Login</Typography.Title>
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
              rules={{ required: true }}
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
        </Form>
        <Form.Item>
          <Space>
            <Button
              disabled={!form.formState.isValid || state.status === "loading"}
              onClick={handleSubmit}
              type="primary"
            >
              {state.status === "loading" ? "Logging in.." : "Login"}
            </Button>
            <Link href="/register" as="/register">
              <Button type="link">Register</Button>
            </Link>
          </Space>
        </Form.Item>
      </Card>
    </div>
  );
}
