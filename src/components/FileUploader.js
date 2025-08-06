// import React, { useState } from 'react';
// import axios from 'axios';

// const FileUploader = ({ type, onUploadSuccess }) => {
//   const [files, setFiles] = useState([]);
//   const [description, setDescription] = useState('');
//   const [status, setStatus] = useState('Idle');

//   const handleChange = (e) => {
//     setFiles(Array.from(e.target.files));
//   };

//   const handleUpload = async () => {
//     if (!files.length) {
//       setStatus('No files selected.');
//       return;
//     }

//     setStatus('Uploading…');

//     const formData = new FormData();
//     formData.append('description', description);

//     files.forEach(file => {
//       formData.append(
//         'files',
//         file,
//         // preserve folder structure if uploading a folder
//         file.webkitRelativePath || file.name
//       );
//     });

//     try {
//       await axios.post(`/files/${type}/`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       setStatus('Uploaded');
//       setFiles([]);
//       setDescription('');
//       onUploadSuccess();
//     } catch (err) {
//       console.error(err);
//       setStatus('Failed');
//     }
//   };

//   return (
//     <div className="file-uploader">
//       <div className="uploader-label">
//         Upload {type.charAt(0).toUpperCase() + type.slice(1)}
//       </div>

//       {type === 'input' ? (
//         <input
//           type="file"
//           onChange={handleChange}
//           multiple
//           webkitdirectory=""
//           directory=""
//         />
//       ) : (
//         <input
//           type="file"
//           onChange={handleChange}
//           multiple
//         />
//       )}

//       <input
//         type="text"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         placeholder="Description"
//       />

//       <button onClick={handleUpload}>Submit</button>
//     </div>
//   );
// };

// export default FileUploader;

import React, { useState } from 'react';
import axios from 'axios';

const FileUploader = ({ type, mode, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Idle');
  const [folderName, setFolderName] = useState('');

  const handleChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (!files.length) {
      setStatus('No files selected.');
      return;
    }

    if (type === 'input' && !folderName && mode==='folder') {
      setStatus('Please enter a folder name.');
      return;
    }

    setStatus('Uploading…');

    const formData = new FormData();
    formData.append('description', description);

    if (type === 'input') {
      formData.append('folder', folderName); // defaults to folder name
    }
  
    formData.append('upload_type', type);

    files.forEach(file => {
      formData.append(
        'files',
        file,
        file.webkitRelativePath || file.name
      );
    });

    try {
      if (type === 'input') {
        if (mode === 'folder'){
          await axios.post(
            `/files/upload/folder`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
        else {
            await axios.post(
            `/files/upload/file`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
        }
      } else {
        await axios.post(
          `/files/upload/${type}/`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      setStatus('Uploaded');
      setFiles([]);
      setDescription('');
      setFolderName('');
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      setStatus('Failed');
    }
  };

  return (
    <div className="file-uploader">
      <div className="uploader-label">
        Upload {type.charAt(0).toUpperCase() + type.slice(1)}
      </div>

      {type === 'input' && mode === 'folder' && (
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
          required
          style={{ marginBottom: '0.5rem' }}
        />
      )}

      {type === 'input' && mode === 'folder' ? (
        <input
          type="file"
          onChange={handleChange}
          multiple
          webkitdirectory=""
          directory=""
        />
      ) : (
        <input
          type="file"
          onChange={handleChange}
          multiple
        />
      )}

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <button className="button-submit" onClick={handleUpload}>Submit</button>

      <div className="upload-status">{status}</div>
    </div>
  );
};

export default FileUploader;
