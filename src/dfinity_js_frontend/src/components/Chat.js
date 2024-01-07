import React, { useState } from "react";
import Loading from "./Loading";
import { useEffect } from "react";
import { login, logout } from "../utils/auth";
import toast from "react-hot-toast";
import SaveAssistant from "./SaveAssistant";
import { useAssistant } from "../context/assistantProvider";
import {
  analyseRunsStepsDone,
  createMessage,
  getAllThreadMessages,
  runTheAssistantOnTheThread,
} from "../utils/chat";
import { useUser } from "../context/userProvider";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const { username } = useUser();
  const [chatMessage, setChatMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assistantModalOpened, setAssistantIdModalOpened] = useState(false);
  const { assistant, thread } = useAssistant();

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  const [whatText, setWahtText] = useState("");
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const handleOpenTypeDialog = () => setOpenTypeDialog(true);
  const handleCloseTypeDialog = () => setOpenTypeDialog(false);
  function blogclicked() {
    handleOpenTypeDialog();
    setWahtText("Blog");
    handleCloseDialog();
  }
  function xclicked() {
    handleOpenTypeDialog();
    setWahtText("Twitter/X");
    handleCloseDialog();
  }

  const [openStartDialog, setOpenStartDialog] = useState(false);
  const handleOpenStartDialog = () => setOpenStartDialog(true);
  const handleCloseStartDialog = () => setOpenStartDialog(false);

  useEffect(() => {
    if (!window.auth.isAuthenticated) {
      handleOpenStartDialog();
    } else {
      handleOpenDialog();
    }
  }, []);

  const updateChatMessage = async () => {
    if (
      window.auth.principalText &&
      window.auth.isAuthenticated &&
      thread?.id
    ) {
      const messages = await getAllThreadMessages(thread.id);
      setChatMessage(messages);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!window.auth.isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    if (!assistant?.id) {
      toast.error("You need to add an assistant first");
      return;
    }

    if (!thread?.id || !assistant?.id) {
      console.log("Cannot create a message without a thread or an assistant");
      return;
    }

    if (!question) return;

    const messageToSend = { content: question, role: "user" };
    setChatMessage((prev) => [messageToSend, ...prev]);
    setLoading(true);
    await createMessage(thread.id, messageToSend);
    setQuestion("");
    const runId = await runTheAssistantOnTheThread(thread.id, assistant.id);
    const done = await analyseRunsStepsDone(thread.id, runId);
    if (done) {
      await updateChatMessage();
      setLoading(false);
    }
  };

  useEffect(() => {
    updateChatMessage();
  }, [window.auth.principalText, window.auth.isAuthenticated, thread?.id]);

  const handleNewSubmit = async (message) => {
    if (!window.auth.isAuthenticated) {
      toast.error("You are not authenticated");
      return;
    }

    if (!assistant?.id) {
      toast.error("You need to add an assistant first");
      return;
    }

    if (!thread?.id || !assistant?.id) {
      console.log("Cannot create a message without a thread or an assistant");
      return;
    }
    const messageToSend = { content: message, role: "user" };
    setChatMessage((prev) => ["Update Context", ...prev]);
    setLoading(true);
    await createMessage(thread.id, messageToSend);
    setQuestion("");
    const runId = await runTheAssistantOnTheThread(thread.id, assistant.id);
    const done = await analyseRunsStepsDone(thread.id, runId);
    if (done) {
      await updateChatMessage();
      setLoading(false);
    }
  };
  function handleSetProfessional() {
    const message = `In the following messages I will be giving you input on what I want to be included in the ${whatText} post.
      Use all of your known knowledge about me and my last ${whatText} posts (if you have any). This time i want you to write in a professional manner.
      I want you to create a very professional ${whatText} post of the information I give you. Do you understand?`;
    handleNewSubmit(message);
    handleCloseTypeDialog();
  }
  function handleSetInformative() {
    const message = `In the following messages I will be giving you input on what I want to be included in the ${whatText} post.
      Use all of your known knowledge about me and my last ${whatText} posts (if you have any). This time i want you to write in an informative and neutral way.
      I want you to create a very informative ${whatText} post of the information I give you. Do you understand?`;
    handleNewSubmit(message);
    handleCloseTypeDialog();
  }
  function handleSetHype() {
    const message = `In the following messages I will be giving you input on what I want to be included in the ${whatText} post.
      Use all of your known knowledge about me and my last ${whatText} posts (if you have any). This time i want you to write a hype post. 
      It should catch the attention of the reader and make them want to read or find out more.
      I want you to create a very positive and hype type ${whatText} post of the information I give you. Do you understand?`;
    handleNewSubmit(message);
    handleCloseTypeDialog();
  }

  function dialogLogIn() {
    window.auth.isAuthenticated ? logout() : login();
    handleCloseStartDialog();
  }

  return (
    <div className="wrapper">
      {/* Dialog for greetings*/}
      <Dialog open={openStartDialog} onClose={handleCloseStartDialog}>
        <DialogTitle>{"Welcome to ChainCrafted"}</DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: "20px",
            }}
          >
            <button
              className="auth-button auth-button__hover"
              onClick={() => dialogLogIn()}
            >
              {window.auth.isAuthenticated
                ? `Log out from ${assistant?.name ?? ""}`
                : "Login"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for Text type */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle style={{ width: "90vw" }}>
          {"Choose what kind of service you are looking for"}
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: "20px",
            }}
          >
            <Button variant="contained" onClick={() => blogclicked()}>
              Create a Blog Post
            </Button>
            <Button variant="contained" onClick={() => xclicked()}>
              Create a Twitter/X Post
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for writing type */}
      <Dialog open={openTypeDialog} onClose={handleCloseDialog}>
        <DialogTitle style={{ width: "90vw" }}>
          {`What kind of ${whatText} post do you want to create? `}
        </DialogTitle>
        <DialogContent>
          <DialogContentText></DialogContentText>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              paddingTop: "20px",
            }}
          >
            <Button variant="contained" onClick={() => handleSetProfessional()}>
              Professional
            </Button>
            <Button variant="contained" onClick={() => handleSetInformative()}>
              Informative
            </Button>
            <Button variant="contained" onClick={() => handleSetHype()}>
              Hype Post
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypeDialog} color="error">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {assistantModalOpened && (
        <SaveAssistant onClose={() => setAssistantIdModalOpened(false)} />
      )}
      <div className="wrapper-header">
        <h1>ChainCrafted</h1>
        {window.auth.isAuthenticated && (
          <>
            <Button
              variant="contained"
              onClick={handleOpenDialog}
            >
              Change Content Type
            </Button>
          </>
        )}
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <button
            className="auth-button auth-button__hover"
            onClick={() => (window.auth.isAuthenticated ? logout() : login())}
          >
            {window.auth.isAuthenticated
              ? `Log out from ${assistant?.name ?? ""}`
              : "Login"}
          </button>
          {window.auth.isAuthenticated && (
            <button
              onClick={() => setAssistantIdModalOpened(true)}
              className="auth-button auth-button__hover"
            >
              {username ?? "Update username"}
            </button>
          )}
        </div>
      </div>
      <div className="container">
        <div className="right">
          <div className="chat active-chat">
            <div className="conversation-start"></div>
            {chatMessage
              .map((message, index) => (
                <div
                  key={index}
                  className={`bubble ${
                    message.role === "user" ? "me" : "assistant"
                  } ${
                    chatMessage.length - 1 === index && !loading
                      ? "last-message"
                      : ""
                  }
                `}
                >
                  {message.content}
                </div>
              ))
              .reverse()}

            {loading && (
              <div className={`bubble assistant`}>
                <Loading />
              </div>
            )}
          </div>
          <div className="write">
            <input
              placeholder="Ask me..."
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            {loading && <Loading />}
            {!loading && (
              <a
                onClick={(e) => {
                  handleSubmit(e);
                }}
                className="write-link send"
              ></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
