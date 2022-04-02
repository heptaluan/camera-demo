const aVideo = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const resetBtn = document.getElementById('reset')
const parsingBtn = document.getElementById('parsing')
const saveBtn = document.getElementById('save')
const boxImg = document.getElementById('boxImg')
const list = document.getElementById('list')
const loading = document.getElementById('loading')

const api = `http://192.168.11.34:5000`
const getImageUrl = `${api}/getImage`
const getListUrl = `${api}/getList`

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
    video: { width: 700, height: 700 },
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
  const fragment = document.createDocumentFragment()
  const arr = str.split(',')
  const num = Number(str.split(',').pop().split(':')[0]) + 1
  for (let i = 1; i < num; i++) {
    const item = document.createElement('li')
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] && Number(arr[j].split(':')[0]) === i) {
        item.innerHTML = arr[j]
      }
    }
    if (item.innerHTML === '') {
      item.innerHTML = `${i}: -`
    }
    fragment.appendChild(item)
  }
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

// 拍照
saveBtn.addEventListener('click', function () {
  getJSON(getImageUrl)
    .then(res => {
      const data = JSON.parse(res)
      if (data.Message === 'Success') {
        video.style.display = 'none'
        boxImg.setAttribute('src', `${api}/${data.Data}`)
        parsingBtn.disabled = ''
        resetBtn.disabled = ''
      } else {
        alert(`请求失败，请重新尝试`)
      }
    })
    .catch(err => {
      console.log(err)
    })
})

// saveBtn.addEventListener('click', function () {
//   ctx.drawImage(aVideo, 0, 0, 700, 700)
//   parsingBtn.disabled = ''
//   resetBtn.disabled = ''
//   video.style.display = 'none'
//   canvas.style.display = 'block'
// })

// 解析
parsingBtn.addEventListener('click', function () {
  loading.style.display = 'flex'
  getJSON(getListUrl)
    .then(res => {
      const data = JSON.parse(res)
      if (data.Message === 'Success') {
        formatData(data.Data)
        loading.style.display = 'none'
        resetBtn.disabled = ''
      } else {
        alert(`请求失败，请重新尝试`)
      }
    })
    .catch(err => {
      console.log(err)
    })
})

// 重制
resetBtn.addEventListener('click', function () {
  boxImg.setAttribute('src', '')
  list.innerHTML = ''
  resetBtn.disabled = 'disabled'
  parsingBtn.disabled = 'disabled'
  canvas.style.display = 'none'
  video.style.display = 'block'
})
