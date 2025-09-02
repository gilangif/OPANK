import { createContext, useContext, useState } from "react"
import { Sheet } from "react-modal-sheet"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import saveFile from "../utils/saveFile"

const GlobalSheetContext = createContext()

export const GlobalSheetProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false)
  const [data, setData] = useState(null)

  const openSheet = (data) => {
    setData(data)
    setOpen(true)
  }

  const closeSheet = () => {
    setOpen(false)
    setData(null)
  }

  return (
    <GlobalSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}

      <Sheet isOpen={isOpen} onClose={closeSheet} detent="content-height">
        <Sheet.Container className="bg-dark">
          <Sheet.Header className="px-3 py-2">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h5 className="m-0">VIEW DATA</h5>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => saveFile(data)}>
                  download
                </span>
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="py-0 py-lg-2 px-3">
            {data && (
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                className="hide-scroll"
                customStyle={{
                  maxHeight: "50vh",
                  borderRadius: "0.8rem",
                  padding: "1rem",
                  fontSize: "0.7rem",
                  overflowY: "auto",
                }}
              >
                {typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)}
              </SyntaxHighlighter>
            )}
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.75)" }} onTap={() => setOpen(false)} />
      </Sheet>
    </GlobalSheetContext.Provider>
  )
}

export const useGlobalSheet = () => useContext(GlobalSheetContext)
