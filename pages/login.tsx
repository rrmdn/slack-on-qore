import React from "react";
import Cookies from "js-cookie";
import { css } from "@emotion/css";
import { KeyOutlined, MailOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Row,
  Space,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { client } from "../qoreContext";
import Link from "next/link";

export default function Login() {
  const form = useForm<{ email: string; password: string; remember: boolean }>({
    defaultValues: { email: "", password: "", remember: true },
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
        Cookies.set("token", token, {
          path: "/",
          expires: values.remember ? 7 : undefined,
        });
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
        padding: 100px 20px;
        justify-content: center;
        align-items: flex-start;
        background: #f9f9fa;
      `}
    >
      <Row
        className={css`
          height: 240px;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          background: #003688;
        `}
      >
        <Col>
          <img src="/pencil-man.png" />
        </Col>
        <Col flex={1}></Col>
        <Col>
          <img src="/austronot-woman.png" />
        </Col>
      </Row>

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
          <Controller
            name="remember"
            control={form.control}
            render={({ value, onChange }) => (
              <Checkbox
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              >
                Remember me
              </Checkbox>
            )}
          />
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
