import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../api/users.js'
import '../styles/UploadForm.css'

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UploadForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null
    setFile(f)
    setError('')
    if (f) {
      if (f.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB')
        setFile(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(f)
    }
  }

  const onPaste = (e) => {
    const pasted = e.clipboardData?.getData('text')
    if (pasted) setUrl(pasted)
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    setError('')
    setMessage('')

    const trimmedTitle = title.trim()
    const trimmedDesc = description.trim()
    const mediaSource = file || url.trim()

    if (!mediaSource) {
      setError('Please select a file or paste a URL')
      return
    }

    if (!trimmedTitle) {
      setError('Title is required')
      return
    }

    if (trimmedTitle.length > 200) {
      setError('Title must be less than 200 characters')
      return
    }

    if (trimmedDesc.length > 2000) {
      setError('Description must be less than 2000 characters')
      return
    }

    setSubmitting(true)
    setProgress(0)
    try {
      let mediaUrl = ''
      if (file) {
        mediaUrl = await readFileAsDataURL(file)
        await new Promise((resolve) => {
          let p = 0
          const id = setInterval(() => {
            p = Math.min(100, p + 10)
            setProgress(p)
            if (p >= 100) {
              clearInterval(id)
              resolve()
            }
          }, 150)
        })
      } else {
        mediaUrl = url.trim()
        await new Promise((resolve) => {
          let p = 0
          const id = setInterval(() => {
            p = Math.min(100, p + 20)
            setProgress(p)
            if (p >= 100) {
              clearInterval(id)
              resolve()
            }
          }, 120)
        })
      }

      const payload = {
        recordType: 'post',
        mediaUrl,
        title: trimmedTitle,
        description: trimmedDesc,
        verified: false,
        subscribers: 0,
        authorId: user.id,
        authorNickname: user.nickname,
        likedBy: [],
        createdAt: new Date().toISOString(),
      }

      await createPost(payload)
      setMessage('Posted successfully! Redirecting...')
      setTimeout(() => {
        setFile(null)
        setUrl('')
        setTitle('')
        setDescription('')
        setPreview('')
        setProgress(0)
        setError('')
        setMessage('')
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
      setProgress(0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="upload-form" onSubmit={submit} onPaste={onPaste}>
      <div className="field-row">
        <label className="field-label">Select File (Image or Video)</label>
        <input 
          className="field-input" 
          type="file" 
          accept="video/*,image/*" 
          onChange={onFileChange}
          disabled={submitting}
        />
        {preview && (
          <div className="preview-box">
            {file?.type.startsWith('video/') ? (
              <video src={preview} controls controlsList="nodownload noplaybackrate noremoteplayback" preload="metadata" onContextMenu={(e)=>e.preventDefault()} />
            ) : (
              <img src={preview} alt="preview" loading="lazy" decoding="async" draggable={false} onContextMenu={(e)=>e.preventDefault()} />
            )}
          </div>
        )}
      </div>

      <div className="field-row">
        <label className="field-label">Or Paste Media URL</label>
        <input 
          className="field-input" 
          placeholder="https://example.com/image.jpg" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="field-row">
        <label className="field-label">Title <span className="required">*</span></label>
        <input 
          className="field-input" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a catchy title..."
          disabled={submitting}
        />
      </div>

      <div className="field-row">
        <label className="field-label">Description</label>
        <textarea 
          className="field-textarea" 
          rows={4} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your post..."
          disabled={submitting}
        />
      </div>

      {submitting && (
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <div className="progress-text">{progress}%</div>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}
      {message && <div className="upload-message">{message}</div>}

      <button 
        className="primary-btn wide" 
        type="submit" 
        disabled={submitting || (!file && !url.trim())}
      >
        {submitting ? `Uploading... ${progress}%` : 'Upload'}
      </button>
    </form>
  )
}
