


function AuxFilesArea(){

    const [uploadedDic, setUploadedDic] = useState(false)

    const [dic, setDic] = useState()

    const [dllArr, setDllArr] = useState([])




    const onDropDic = (accept, reject) => {
        if (reject.length !== 0 || accept.length > 1) {
            //this.setState({ showWarning: true, warningMessage: "Please upload only one .txt file" })
            alert("WIP- one txt file only!")
        }

        /*else {

            if (this.findDuplicate(accept, this.state.acceptDIC)) {
                this.setState({ showWarning: true, warningMessage: "One or more of the uploaded files was already uploaded" })
                return
            }

            this.setState({ acceptDIC: accept, transitionDIC: true  })
        } */

        const txtFile = accept[0]; // Assuming you're only allowing one file to be dropped

        setDic(txtFile)


        if (txtFile) {
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContents = event.target.result;
                // Do something with fileContents, like displaying it in your component
                console.log(fileContents);
            };

            reader.readAsText(txtFile);
        }
    }

    const onDropDll = (accept, reject) => {
        if (reject.length !== 0) {
            //this.setState({ showWarning: true, warningMessage: "Please upload only one .txt file" })
            alert("WIP- dll files only!")
        }
        /* else {

            if (this.findDuplicate(accept, this.state.acceptDIC)) {
                this.setState({ showWarning: true, warningMessage: "One or more of the uploaded files was already uploaded" })
                return
            }

            this.setState({ acceptDIC: accept, transitionDIC: true  })
        } */

        const dllFile = accept[0]

        setDllArr([...dllArr, dllFile]);

        console.log("dll dropped");
    }


    return (
        <div>
            <div className="root-dropzone">
                    <Dropzone accept=".txt" onDrop={onDropDic}>
                        {({ getRootProps, getInputProps }) => (
                                <div
                                    {...getRootProps({
                                        className: 'dropzone'
                                    })}
                                >
                                    <input {...getInputProps()} />
                                    <p>WIP TXT </p>
                                </div>
                        )}
                    </Dropzone>
                </div>


                <div className="root-dropzone">
                    <Dropzone accept=".dll" onDrop={onDropDll}>
                        {({ getRootProps, getInputProps }) => (
                                <div
                                    {...getRootProps({
                                        className: 'dropzone'
                                    })}
                                >
                                    <input {...getInputProps()} />
                                    <p>WIP DLL</p>
                                </div>
                        )}
                    </Dropzone>
                </div>
        </div>
    )
}