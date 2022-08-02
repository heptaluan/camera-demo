

const api = `http://192.168.11.99:5000`
const getImageUrl = `${api}/getImage`
const getListUrl = `${api}/getList`
const updateImageUrl = `${api}/imageprocess`

const aVideo = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const resetBtn = document.getElementById('reset')
const parsingBtn = document.getElementById('parsing')
const saveBtn = document.getElementById('save')
const boxImg = document.getElementById('boxImg')
const list = document.getElementById('list')
const loading = document.getElementById('loading')
const upload = document.getElementById('upload')
const result = document.getElementById('result')

const videoW = document.querySelector('.right-box').offsetWidth
const videoH = document.querySelector('.right-box').offsetHeight

aVideo.width = videoW
aVideo.height = videoH
canvas.width = videoW
canvas.height = videoH

initVideoStyle()

window.onresize = function () {
  initVideoStyle()
}

function initVideoStyle() {
  const videoW = document.querySelector('.right-box').offsetWidth
  const videoH = document.querySelector('.right-box').offsetHeight

  aVideo.width = videoW
  aVideo.height = videoH
  canvas.width = videoW
  canvas.height = videoH
}

// chrome://flags/#unsafely-treat-insecure-origin-as-secure

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia ||
  navigator.mediaDevices.getUserMedia

// 参数一获取用户打开权限，参数二是一个回调函数，自动传入视屏流，成功后调用，并传一个视频流对象，参数三打开失败后调用，传错误信息
navigator.getUserMedia(
  {
    video: { width: 1920, height: 1080 },
  },
  gotStream,
  noStream
)

function gotStream(stream) {
  aVideo.srcObject = stream
  aVideo.onerror = function () {
    stream.stop()
  }
  stream.onended = noStream
  aVideo.onloadedmetadata = function () {
    console.log(`摄像头成功打开`)
  }
}

function noStream(err) {
  alert(err)
}

const saveAs = (filename = '未命名', mimetype = 'image/png') => {
  if (canvas.msToBlob) {
    const blob = canvas.msToBlob()
    return window.navigator.msSaveBlob(blob, filename)
  }

  const lnk = document.createElement('a')
  lnk.download = filename
  lnk.href = canvas.toDataURL(mimetype, 1)

  if (document.createEvent) {
    const e = document.createEvent('MouseEvents')
    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    lnk.dispatchEvent(e)
  } else if (lnk.fireEvent) {
    lnk.fireEvent('onclick')
  }
}

const formatData = str => {
  list.innerHTML = ''
  const fragment = document.createDocumentFragment()
  const arr = str.split(',')
  const num = Number(str.split(',').pop().split(':')[0]) + 1
  let total = 0
  for (let i = 1; i < num; i++) {
    const item = document.createElement('div')
    item.className = `box-wrap`
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] && Number(arr[j].split(':')[0]) === i) {
        item.innerHTML = `<span class="list-index">${arr[j].split(':')[0]}</span><span class="list-detail">${
          arr[j].split(':')[1] ? arr[j].split(':')[1] : '-'
        }</span>`
        if (arr[j].split(':')[1]) {
          total++
        }
      }
    }
    fragment.appendChild(item)
  }

  result.innerHTML = total

  list.appendChild(fragment)
}

const getJSON = url => {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          resolve(this.responseText, this)
        } else {
          var resJson = { code: this.status, response: this.response }
          reject(resJson, this)
        }
      }
    }
    xhr.send()
  })
}

// 手动上传文件
const handleLoadFile = e => {
  let file = e.target.files[0]

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = function (e) {
    boxImg.setAttribute('src', e.target.result)
  }

  const formData = new FormData()
  formData.append('image', file)

  const xhr = new XMLHttpRequest()
  xhr.open('POST', updateImageUrl, true)
  xhr.onreadystatechange = function (res) {
    if (this.readyState === 4) {
      if (this.status === 200) {
        const data = JSON.parse(this.response)
        if (data.Code === '200') {
          alert(`图片上传成功`)
          saveBtn.disabled = 'disabled'
        }
      } else {
        var resJson = { code: this.status, response: this.response }
        console.log(resJson)
        alert(`图片上传失败，请刷新后重新尝试`)
        handleReset()
      }
    }
  }
  xhr.send(formData)

  parsingBtn.disabled = ''
  resetBtn.disabled = ''
  video.style.display = 'none'
  upload.value = ''
}

// 拍照
saveBtn.addEventListener('click', function () {
  const videoW = document.querySelector('.right-box').offsetWidth
  const videoH = document.querySelector('.right-box').offsetHeight
  ctx.drawImage(aVideo, 0, 0, videoW, videoH)
  const base64 = canvas.toDataURL('image/png')
  boxImg.setAttribute('src', base64)

  const data = dataUrlToBlob(canvas.toDataURL('image/png', 1))
  const formData = new FormData()
  formData.append('image', data)

  const xhr = new XMLHttpRequest()

  video.style.display = 'none'

  xhr.open('POST', updateImageUrl, true)
  xhr.onreadystatechange = function (res) {
    if (this.readyState === 4) {
      if (this.status === 200) {
        const data = JSON.parse(this.response)
        if (data.Code === '200') {
          parsingBtn.disabled = ''
          resetBtn.disabled = ''
          alert(`拍照上传成功`)
        }
      } else {
        var resJson = { code: this.status, response: this.response }
        console.log(resJson)
        handleReset()
        alert(`拍照上传失败，请刷新后重新尝试`)
      }
    }
  }
  xhr.send(formData)
})

// 解析
parsingBtn.addEventListener('click', function () {
  loading.style.display = 'flex'
  getJSON(getListUrl)
    .then(res => {
      const data = JSON.parse(res)
      if (data.Message === 'Success') {
        if (data.Data === '') {
          alert(`图片解析结果为空，请检查图片后重新进行尝试`)
          loading.style.display = 'none'
          handleReset()
          result.innerHTML = `0`
        } else {
          formatData(data.Data)
          loading.style.display = 'none'
          resetBtn.disabled = ''
          alert(`图片解析成功`)
          video.style.display = 'none'
          boxImg.setAttribute('src', `${api}/${data.image}`)
          parsingBtn.disabled = ''
          resetBtn.disabled = ''
        }
      } else {
        alert(`图片解析失败，请重新尝试`)
      }
    })
    .catch(err => {
      console.log(err)
    })
})

// 重置
resetBtn.addEventListener('click', function () {
  handleReset()
})

// base64 转化为 file
function dataUrlToBlob(base64, mimeType = 'image/png') {
  let bytes = window.atob(base64.split(',')[1])
  let ab = new ArrayBuffer(bytes.length)
  let ia = new Uint8Array(ab)
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeType })
}

// 重置事件
function handleReset() {
  boxImg.setAttribute('src', '')
  list.innerHTML = '<div id="empty">暂无内容</div>'
  saveBtn.disabled = ''
  resetBtn.disabled = 'disabled'
  parsingBtn.disabled = 'disabled'
  video.style.display = 'block'
  upload.value = ''
  result.innerHTML = `0`
}
