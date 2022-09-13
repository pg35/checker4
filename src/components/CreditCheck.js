import { useState, useEffect } from "react";
import { Container, Button, Table, Heading } from "./styled";
import { doAjax } from "../util";
import Spinner from "./Spinner";

export default function CreditCheck(props) {
  const { state, setState } = props;
  const { status, credits, text, sandbox } = state;
  console.log("sandbox", sandbox);
  const [poll, setPoll] = useState(0);
  const scan_id = state.scan_id;

  useEffect(() => {
    let pollXHR;
    if (poll) {
      pollXHR = doAjax({
        data: {
          action: "pxq_pgck_get_check_credits_result",
          scan_id: scan_id
        },
        method: "GET",
        dataType: "json"
      })
        .done((data, textStatus, jqXHR) => {
          console.log("getcred", data);
          if (data.success && data.data && data.data.credits) {
            setState({ ...state, credits: data.data.credits, status: 2 });
          } else {
            setTimeout(() => setPoll(poll + 1), 1000);
          }
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          console.log("getcred failed", poll, scan_id, textStatus);
          if ("abort" === textStatus) return;
          setState({ ...state, status: 3, error: "Ajax Error " + textStatus });
        })
        .always(() => {
          pollXHR = null;
        });
    }
    return () => {
      console.log("unmount in poll", !!pollXHR, poll, scan_id);
      if (pollXHR) pollXHR.abort();
    };
  }, [poll, scan_id]);

  useEffect(() => {
    console.log("cc use effect", text, scan_id);

    let xhr = doAjax({
      data: {
        action: "pxq_pgck_check_credits",
        text: text,
        sandbox: sandbox
      },
      method: "POST",
      dataType: "json"
    })
      .done((data, textStatus, jqXHR) => {
        console.log("credit checker success", scan_id, data.data.scan_id);
        setState({ ...state, scan_id: data.data.scan_id });
        setPoll(1);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.log(
          "credcheck failed",
          scan_id,
          textStatus,
          errorThrown,
          jqXHR
        );
        if ("abort" === textStatus) return;
        setState({ ...state, status: 3, error: "Ajax Error " + textStatus });
      })
      .always(() => {
        xhr = null;
      });
    return () => {
      console.log("unmounting credit checker", !!xhr);
      if (xhr) xhr.abort();
    };
  }, []);

  let heading = null;
  if (1 === status) heading = <h3>Checking credits</h3>;
  else if (2 === status)
    heading = <Heading success>Credit check completed</Heading>;
  else heading = <Heading>Credit check failed</Heading>;
  console.log("credit check render");
  return (
    <div>
      <Container>
        {heading}
        {1 === status ? (
          <p>
            <Spinner />
          </p>
        ) : null}
        {3 === status ? (
          <p>
            <strong>Reason:</strong> {state.error}
          </p>
        ) : null}
        <Table>
          <tbody>
            <tr>
              <th>Sandbox mode</th>
              <td>
                {true === sandbox ? (
                  "ON"
                ) : (
                  <span style={{ color: "red" }}>OFF</span>
                )}
              </td>
            </tr>
            {2 === status ? (
              <tr>
                <th>Plagiarism check {sandbox ? "expected" : ""} cost</th>
                <td>{credits} credits</td>
              </tr>
            ) : null}
          </tbody>
        </Table>
        {sandbox ? (
          <div>
            <small>
              Sandbox mode shows expected cost.
              <br />
              No credit is charged in sandbox mode.
            </small>
          </div>
        ) : null}
      </Container>
      <Button
        onClick={() => {
          if (1 === status) {
            if (
              window.confirm(
                "Currently, credit check is in progress.\nAre you sure you want to cancel it and restart?"
              )
            ) {
              setPoll(0);
              setState({ ...state, step: 1, status: 1 });
            }
          } else setState({ ...state, step: 1, status: 1 });
        }}
      >
        Restart
      </Button>

      <Button
        onClick={() => {
          if (
            window.confirm(
              `Plagiarism check will cost you ${credits} credits?\nAre you sure you want to continue?`
            )
          )
            setState({ ...state, step: 3, status: 1, export: false, pdf: "" });
        }}
        disabled={2 === status ? false : true}
      >
        Check plagiarism
      </Button>
    </div>
  );
}
