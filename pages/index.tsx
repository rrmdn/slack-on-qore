import React from "react";
import { css } from "@emotion/css";
import stc from "string-to-color";
import {
  Button,
  Card,
  Col,
  Input,
  Menu,
  Row,
  Skeleton,
  Typography,
  Avatar,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Image,
} from "antd";
import {
  FileOutlined,
  LinkOutlined,
  LoadingOutlined,
  MailOutlined,
  NumberOutlined,
  PlusOutlined,
  SendOutlined,
} from "@ant-design/icons";
import qoreContext, { client } from "../qoreContext";
import dayjs from "../dayjs";
import { Controller, useForm } from "react-hook-form";
import produce from "immer";

const useCurrentUser = () => {
  const currentMembers = qoreContext.view("currentMember").useListRow();
  const user = React.useMemo(() => {
    return currentMembers.data[0];
  }, [currentMembers.data]);
  return user;
};

const ChannelMessages = (props: { id: string }) => {
  const channel = qoreContext.view("channelDefaultView").useGetRow(props.id);
  const channelMessages = qoreContext.view("channelMessages").useListRow({
    channelID: props.id,
    "$by.createdAt": "desc",
    offset: 0,
    limit: 10,
  });
  const latestTimestamp = React.useMemo(() => {
    const latestMessage = channelMessages.data[channelMessages.data.length];
    return dayjs(latestMessage?.createdAt).toISOString();
  }, [channelMessages.data]);
  const latestChannelMessages = qoreContext.view("channelMessages").useListRow(
    {
      channelID: props.id,
      "$by.createdAt": "desc",
      after: latestTimestamp,
    },
    {
      pollInterval: 5000,
    }
  );
  React.useEffect(() => {
    if (latestChannelMessages.data.length) {
      channelMessages.revalidate({
        networkPolicy: "cache-only",
        optimisticResponse: {
          nodes: [...latestChannelMessages.data, ...channelMessages.data],
        },
      });
    }
  }, [latestChannelMessages.data]);
  const handleLoadMore = React.useCallback(() => {
    channelMessages.fetchMore({
      channelID: props.id,
      "$by.createdAt": "desc",
      offset: channelMessages.data.length,
      limit: 10,
    });
  }, [channelMessages.data, props.id]);
  const currentUser = useCurrentUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<{ image?: string }>({});
  const form = useForm<{ message: string }>({
    defaultValues: { message: "" },
    mode: "onChange",
  });
  const sendMessage = qoreContext
    .view(
      channel.data?.type === "channel" ? "joinedChannels" : "privateChannels"
    )
    .useActions(props.id);

  const handleSendMessage = React.useCallback(async () => {
    if (!currentUser?.id) return;
    const { message } = form.getValues();
    form.reset({ message: "" });
    setState({});
    await sendMessage
      .action("sendMessage")
      .trigger({ message, attachment: state.image });
  }, [currentUser?.id, props.id, state]);
  const handleUpload = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.item(0);
      if (!file) return;
      const url = await qoreContext.client.views.messagesDefaultView.upload(
        file
      );
      setState({ image: url });
    },
    []
  );
  const handleEnter = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );
  if (channel.status === "loading" || !channel.data) return <Skeleton />;
  return (
    <div
      className={css`
        position: relative;
        width: 100%;
        height: 100%;
        background: url("/bg-chat.svg") no-repeat center;
      `}
    >
      <div
        className={css`
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          height: 56px;
          background: white;
        `}
      >
        <Typography.Title level={4}>{channel.data.name}</Typography.Title>
      </div>
      <div
        className={css`
          padding: 16px;
          display: flex;
          flex-direction: column-reverse;
          position: absolute;
          top: 56px;
          bottom: 64px;
          left: 0;
          right: 0;
          overflow-y: auto;
        `}
      >
        {channelMessages.data.map((channelMessage) => {
          const isSelf = currentUser?.id === channelMessage.from.id;
          return (
            <div
              key={channelMessage.id}
              className={css`
                margin: 6px 0;
                display: flex;
                ${isSelf &&
                css`
                  justify-items: right;
                  flex-direction: row-reverse;
                `}
              `}
            >
              <div
                className={css`
                  margin: 0 12px;
                `}
              >
                <Avatar
                  size="small"
                  style={{
                    backgroundColor: stc(channelMessage.from.displayField),
                  }}
                >
                  {channelMessage.from.displayField.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <div
                className={css`
                  text-align: ${isSelf ? "right" : "left"};
                `}
              >
                {!isSelf && (
                  <>
                    <Typography.Text strong>
                      {channelMessage.from.displayField}
                    </Typography.Text>
                    <br />
                  </>
                )}
                <div
                  className={css`
                    padding: 6px 8px;
                    display: inline-block;
                    border-radius: 8px;
                    max-width: 560px;
                    background-color: #dcdcdc;
                    ${isSelf &&
                    css`
                      background-color: #003688;
                      span {
                        color: #fff !important;
                      }
                    `}
                  `}
                >
                  <Typography.Text>{channelMessage.message}</Typography.Text>
                </div>
                <br />
                {channelMessage.attachment && (
                  <>
                    <br />
                    <Image width="128px" src={channelMessage.attachment} />
                    <br />
                  </>
                )}
                <Typography.Text>
                  {dayjs(channelMessage.createdAt).fromNow()}
                </Typography.Text>
              </div>
              <div
                className={css`
                  flex: 1;
                `}
              />
            </div>
          );
        })}
        <Button
          type="link"
          onClick={handleLoadMore}
          disabled={channelMessages.status === "loading"}
        >
          Load more
        </Button>
      </div>
      <div
        className={css`
          position: absolute;
          padding: 24px;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
        `}
      >
        {state.image && (
          <div
            className={css`
              margin-right: 12px;
            `}
          >
            <Image width="32px" src={state.image} />
          </div>
        )}
        <div
          className={css`
            flex: 1;
            margin-right: 12px;
          `}
        >
          <Controller
            control={form.control}
            name="message"
            rules={{ required: true, min: 1 }}
            render={({ value, onChange }) => (
              <Input
                suffix={
                  <Tooltip title="Upload file">
                    <div
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className={css`
                        cursor: pointer;
                        position: relative;
                      `}
                    >
                      <input
                        className={css`
                          display: none;
                        `}
                        ref={fileInputRef}
                        onChange={handleUpload}
                        type="file"
                        accept="image/*"
                      />
                      <LinkOutlined />
                    </div>
                  </Tooltip>
                }
                onKeyPress={handleEnter}
                value={value}
                onChange={onChange}
                placeholder="Type a message.."
              />
            )}
          />
        </div>
        <div>
          <Button
            disabled={!form.formState.isValid}
            onClick={handleSendMessage}
            type="primary"
            icon={<SendOutlined />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const currentUser = useCurrentUser();
  const [state, setState] = React.useState<{
    activeKey?: string;
    search: string;
  }>({ search: "" });
  const joinedChannels = qoreContext.view("joinedChannels").useListRow({
    search: state.search,
    limit: currentUser?.id ? undefined : 0, // skip fetching
  });
  // const privateChannels = qoreContext.view("privateChannels").useListRow({
  //   search: state.search,
  //   limit: currentUser?.id ? undefined : 0, // skip fetching
  // });
  const publicMembers = qoreContext.view("publicMembers").useListRow({
    search: state.search,
    limit: !!state.search ? 5 : 0,
  });
  const { insertRow, status } = qoreContext
    .view("joinedChannels")
    .useInsertRow();

  const handleSearch = React.useCallback((search: string) => {
    setState((state) =>
      produce(state, (draft) => {
        draft.search = search;
      })
    );
  }, []);

  return (
    <div
      className={css`
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: #f9f9fa;
      `}
    >
      <div
        className={css`
          display: flex;
          height: 100%;
        `}
      >
        <div
          className={css`
            overflow-y: auto;
            height: 100%;
            background-color: #003688;
            width: 280px;
          `}
        >
          <div
            className={css`
              padding: 12px;
              height: 56px;
            `}
          >
            <Input.Search
              onSearch={handleSearch}
              allowClear
              placeholder="Search or add"
            />
          </div>
          <Menu
            className={css`
              .ant-menu-item {
                color: #99c1ff !important;
              }
              .ant-menu-item-selected {
                color: #003688 !important;
              }
            `}
            mode="inline"
            defaultOpenKeys={["channels", "privateMessages"]}
            activeKey={state.activeKey}
            onSelect={async (e) => {
              let channelID = `${e.key}`;
              if (e.key === "item_0") {
                if (!currentUser || status === "loading") return;
                const done = message.loading(`Creating channel`);
                const newChannel = await insertRow({
                  name: state.search,
                  member1: [currentUser.id],
                  type: "channel",
                });
                if (newChannel?.id) {
                  channelID = newChannel?.id;
                }
                done();
              }
              if (`${e.key}`.startsWith("other")) {
                channelID = (e.key as string).replace("other", "");
                if (!currentUser?.id) return;
                const done = message.loading(`Joining channel`);
                await client.views.channelDefaultView.addRelation(channelID, {
                  member1: [currentUser?.id],
                });
                done();
              }
              if (`${e.key}`.startsWith("private")) {
                const memberID = (e.key as string).replace("private", "");
                if (!currentUser?.id) return;
                const done = message.loading(`Initiating DM`);
                const newChannel = await insertRow({
                  name: "",
                  member1: [currentUser.id, memberID],
                  type: "private",
                });
                if (newChannel?.id) {
                  channelID = newChannel?.id;
                }
                done();
              }

              setState((state) =>
                produce(state, (draft) => {
                  draft.activeKey = channelID;
                  draft.search = "";
                })
              );
              joinedChannels.revalidate();
            }}
          >
            {state.search && (
              <Menu.Item
                icon={
                  status === "loading" ? (
                    <LoadingOutlined spin />
                  ) : (
                    <PlusOutlined />
                  )
                }
              >
                New channel "{state.search}"
              </Menu.Item>
            )}
            {publicMembers.data.map((member) => (
              <Menu.Item key={`DM:${member.email}`} icon={<MailOutlined />}>
                DM to {member.email}
              </Menu.Item>
            ))}
            <Menu.SubMenu key="channels" title="Channels">
              {joinedChannels.data.map((channel) => (
                <Menu.Item key={channel.id} icon={<NumberOutlined />}>
                  {channel.name}
                </Menu.Item>
              ))}
            </Menu.SubMenu>
            {/* <Menu.SubMenu key="privateMessages" title="Private Messages">
              {privateChannels.data
                .filter((channel) => channel.hasCurrentUser)
                .map((channel) => (
                  <Menu.Item key={channel.id} icon={<MailOutlined />}>
                    {
                      channel.member1.nodes.find(
                        (member) => member.id !== currentUser.id
                      )?.displayField
                    }
                  </Menu.Item>
                ))}
            </Menu.SubMenu> */}
          </Menu>
        </div>
        <div
          className={css`
            border-left: 1px solid rgba(0, 0, 0, 0.1);
            height: 100%;
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
          `}
        >
          {state.activeKey ? (
            <ChannelMessages key={state.activeKey} id={state.activeKey} />
          ) : (
            <div
              className={css`
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                height: 100%;
                width: 100%;
              `}
            >
              <div>
                <Typography.Title level={4}>Welcome!</Typography.Title>
                <Typography.Text strong>
                  Please select one of your channels to start messaging
                </Typography.Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
