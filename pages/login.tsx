import React from "react";
import Cookies from "js-cookie";
import { css } from "@emotion/css";
import { KeyOutlined, MailOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  message,
  Space,
  Typography,
} from "antd";
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
          box-shadow: 0 0px 9px 5px rgb(0 0 0 / 10%);
        `}
      >
        <Typography.Title level={4}>Login to Slack on Qore</Typography.Title>
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
              rules={{ required: true }}
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
        </Form>
        <Form.Item>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Space>
          <Button
            disabled={!form.formState.isValid || state.status === "loading"}
            onClick={handleSubmit}
            type="primary"
          >
            {state.status === "loading" ? "Logging in.." : "Login"}
          </Button>
          <Link href="/register" as="/register">
            <Button>Register</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
}
