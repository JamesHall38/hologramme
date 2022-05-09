import React, { useCallback } from 'react'
import download from './assets/download.jpg'
import { useDropzone } from 'react-dropzone'


const DragAndDrop = ({ files, setFiles }) => {
    const onDrop = useCallback(acceptedFiles => {
        acceptedFiles.forEach((file) => {
            const reader = new FileReader()

            reader.onabort = () => console.log('file reading was aborted')
            reader.onerror = () => console.log('file reading has failed')
            reader.onload = () => {

                setFiles(reader.result)
            }
            reader.readAsArrayBuffer(file)
        })
    }, [])
    const { getRootProps, getInputProps } = useDropzone({ onDrop })

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {
                <p className='drop'>
                    Import model
                    <img src={download} alt="download" style={{ position: 'relative', width: '50px', height: '50px' }} />
                </p>
            }
        </div>
    )
}

export default DragAndDrop