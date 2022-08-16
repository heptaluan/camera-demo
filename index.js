const api = `http://192.168.11.99:5000`
// const api = `http://127.0.0.1:5000`
const getImageUrl = `${api}/getImage`
const getListUrl = `${api}/getList`
const updateImageUrl = `${api}/imageprocess`
const scale = 5

const aVideo = document.getElementById('video')
const bVideo = document.getElementById('video2')
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
const canvasMask = document.getElementById('canvas-mask')
const exportBtn = document.getElementById('exportBtn')

const videoW = document.querySelector('.right-box').offsetWidth
const videoH = document.querySelector('.right-box').offsetHeight

const searchInput = document.getElementById('search-input')
const searchBtn = document.getElementById('search-btn')
const searchReset = document.getElementById('search-reset')

let dataListCatch = ''

aVideo.width = videoW
aVideo.height = videoH

canvas.width = videoW * scale
canvas.height = videoH * scale
bVideo.width = videoW * scale
bVideo.height = videoH * scale

initVideoStyle()

window.onresize = function () {
  initVideoStyle()
}

function initVideoStyle() {
  const videoW = document.querySelector('.right-box').offsetWidth
  const videoH = document.querySelector('.right-box').offsetHeight

  aVideo.width = videoW
  aVideo.height = videoH

  canvas.width = videoW * scale
  canvas.height = videoH * scale
  bVideo.width = videoW * scale
  bVideo.height = videoH * scale
}

// chrome://flags/#unsafely-treat-insecure-origin-as-secure

// navigator.getUserMedia =
//   navigator.getUserMedia ||
//   navigator.webkitGetUserMedia ||
//   navigator.mozGetUserMedia ||
//   navigator.msGetUserMedia ||
//   navigator.mediaDevices.getUserMedia

// 参数一获取用户打开权限，参数二是一个回调函数，自动传入视屏流，成功后调用，并传一个视频流对象，参数三打开失败后调用，传错误信息
// navigator.getUserMedia(
//   {
//     video: { width: 1920, height: 1080 },
//   },
//   gotStream,
//   noStream
// )

function gotStream(stream) {
  aVideo.srcObject = stream
  aVideo.onerror = function () {
    stream.stop()
  }
  stream.onended = noStream
  aVideo.onloadedmetadata = function () {
    console.log(`摄像头成功打开`)
  }

  bVideo.srcObject = stream
  bVideo.onerror = function () {
    stream.stop()
  }
  stream.onended = noStream
  bVideo.onloadedmetadata = function () {
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
        }</span><span class="list-code">${formatCode(Number(arr[j].split(':')[0]))}</span>`
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

const formatSearchData = arr => {
  list.innerHTML = ''
  const fragment = document.createDocumentFragment()
  for (let i = 0; i < arr.length; i++) {
    const item = document.createElement('div')
    item.className = `box-wrap`
    item.innerHTML = `<span class="list-index">${arr[i].split(':')[0]}</span><span class="list-detail">${arr[i].split(':')[1]}</span><span class="list-code">${formatCode(Number(arr[i].split(':')[0]))}</span>`
    fragment.appendChild(item)
  }
  list.appendChild(fragment)
}

const formatCode = num => {
  if (num <= 10) {
    return num % 10 === 0 ? `A1${num % 10}` : `A${num % 10}`
  } else if (num > 10 && num <= 20) {
    return getCodeType(num, `B`)
  } else if (num > 20 && num <= 30) {
    return getCodeType(num, `C`)
  } else if (num > 30 && num <= 40) {
    return getCodeType(num, `D`)
  } else if (num > 40 && num <= 50) {
    return getCodeType(num, `E`)
  } else if (num > 50 && num <= 60) {
    return getCodeType(num, `F`)
  } else if (num > 60 && num <= 70) {
    return getCodeType(num, `G`)
  } else if (num > 70 && num <= 80) {
    return getCodeType(num, `H`)
  } else if (num > 80 && num <= 90) {
    return getCodeType(num, `I`)
  } else if (num > 90) {
    return getCodeType(num, `J`)
  }
}

const getCodeType = (num, type) => {
  return num % 10 === 0 ? `${type}1${num % 10}` : `${type}${num % 10}`
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
          // saveBtn.disabled = 'disabled'
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

// 导出
exportBtn.addEventListener('click', function () {
  const exportList = list.querySelectorAll('.box-wrap')
  const exportData = []
  console.log(exportList)

  for (let i = 0; i < exportList.length; i++) {
    const index = exportList[i].querySelector('.list-index').innerHTML
    const content = exportList[i].querySelector('.list-detail').innerHTML
    exportData.push({
      序列号: index,
      编号: content,
    })
  }

  const fileName = `解析列表`
  downloadFile(exportData, fileName)
})

// 下载文件
const downloadFile = (data, fileName) => {
  const sheet = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, fileName)
  const workbookBlob = workbook2blob(wb)
  openDownload(workbookBlob, `${fileName}.csv`)
}

// 创建 blobUrl，通过 createObjectURL 实现下载
const openDownload = (blob, fileName) => {
  if (typeof blob === 'object' && blob instanceof Blob) {
    blob = URL.createObjectURL(blob)
  }
  const aLink = document.createElement('a')
  aLink.href = blob
  aLink.download = fileName || ''
  let event
  if (window.MouseEvent) event = new MouseEvent('click')
  else {
    event = document.createEvent('MouseEvents')
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  }
  aLink.dispatchEvent(event)
}

// 将 workbook 转化为 blob 对象
const workbook2blob = workbook => {
  const wopts = {
    bookType: 'csv',
    bookSST: false,
    type: 'binary',
  }
  const wbout = XLSX.write(workbook, wopts)
  const blob = new Blob([s2ab(wbout)], {
    type: 'application/octet-stream',
  })
  return blob
}

// 将字符串转ArrayBuffer
const s2ab = s => {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

// 拍照
// saveBtn.addEventListener('click', function () {
//   canvasMask.style.display = 'flex'
//   setTimeout(() => {
//     const videoW = document.getElementById('video2').offsetWidth
//     const videoH = document.getElementById('video2').offsetHeight
//     ctx.drawImage(bVideo, 0, 0, videoW, videoH)
//     const base64 = canvas.toDataURL('image/png')
//     boxImg.setAttribute('src', base64)

//     const data = dataUrlToBlob(canvas.toDataURL('image/png', 1))
//     const formData = new FormData()
//     formData.append('image', data)

//     const xhr = new XMLHttpRequest()

//     video.style.display = 'none'

//     xhr.open('POST', updateImageUrl, true)
//     xhr.onreadystatechange = function (res) {
//       if (this.readyState === 4) {
//         if (this.status === 200) {
//           const data = JSON.parse(this.response)
//           if (data.Code === '200') {
//             parsingBtn.disabled = ''
//             resetBtn.disabled = ''
//             alert(`拍照上传成功`)
//             canvasMask.style.display = 'none'
//           }
//         } else {
//           var resJson = { code: this.status, response: this.response }
//           console.log(resJson)
//           handleReset()
//           alert(`拍照上传失败，请刷新后重新尝试`)
//           canvasMask.style.display = 'none'
//         }
//       }
//     }
//     xhr.send(formData)
//   }, 0)
// })

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
          dataListCatch = data.Data
          formatData(data.Data)
          loading.style.display = 'none'
          resetBtn.disabled = ''
          alert(`图片解析成功`)
          video.style.display = 'none'
          boxImg.setAttribute('src', `${api}/${data.image}`)
          parsingBtn.disabled = ''
          resetBtn.disabled = ''
          exportBtn.disabled = ''
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
  // saveBtn.disabled = ''
  resetBtn.disabled = 'disabled'
  parsingBtn.disabled = 'disabled'
  exportBtn.disabled = 'disabled'
  video.style.display = 'block'
  upload.value = ''
  result.innerHTML = `0`
  searchInput.value = ''
}

// const data =
//   '1:AF28WWX33M-S4,2:AFKBHRRUF8-S4,3:ADEFALX2FM-S4,4:ACUCPS5843-S4,5:AER93G8FQ7-S4,6:ADFJ4HBK95-S4,7:,8:AK6JDTR6JW-S4,9:AKH46DCQ7L-S4,10:AJLFSYWC7C-S4,11:AJ84PYPJ8U-S4,12:APMQRMCTNB-S4,13:AC8CVNCSY4-S4,14:AC6VTGUEWF-S4,15:AP385M2M95-S4,16:APHDK4UNHD-S4,17:APBWJNYXJX-S4,18:APD2CKDHCF-S4,19:APE56FR35W-S4,20:AC3METQSJY-S4,21:AP6GJA69LK-S4,22:AC5FRBD2UT-S4,23:AP659Y2ECD-S4,24:AP9QWW9UXY-S4,25:ACMFJ9TBFV-S4,26:APGAR8H5PV-S4,27:APF7XC5KWE-S4,28:ADU9FSN8T3-S4,29:AG3KR5YHBD-S4,30:AERXL3G6LS-S4,31:A9HRNXFAS5-S4,32:AAK5H6GP8G-S4,33:AA62UK27QN-S4,34:AAA2SSDHMF-S4,35:AAGWVDQLMH-S3,36:AAFU4HD3U2-S3,37:AAJ2PA56EY-S4,38:AKCPWTUK8C-S3,39:ALL9B32D5F-S3,40:AJBD5MT6RY-S3,41:AKQCH9TNMH-S3,42:AK9FJ7QWTV-S3,43:ALFV4HJ7XH-S3,44:AJQFR9AN9S-S3,45:AL5CBXWMBT-S3,46:AM5LCALGXP-S3,47:AK8CQBDE3E-S3,48:ALGLE9LKHA-S3,49:AK675JMBGF-S3,50:AJHVWX3EHV-S3,51:AJVJHD2HX3-S3,52:ALTUW8M6MT-S3,53:AHYW6YL5WS-S3,54:,55:AJFQC7BBUN-S4,56:AKHSNXLETC-S4,57:AJLFSYWCAR-S4,58:AMCUP74F6N-S4,59:ALPHPP5YEM-S4,60:AL63UK7BRV-S4,61:AKRFB688CQ-S4,62:AK39Y7MJAV-S4,63:AL7V82SK4P-S4,64:AJRJK5N7Y2-S4,65:AL36Q87JNL-S4,66:AK3YHRV8T8-S4,67:AM33G8QK3B-S4,68:ALTHMWHBBE-S4,69:ALASCDSC7Y-S4,70:AKV3Y4FNX9-S4,71:AJDVYPP4HR-S4,72:ALESAM6N3N-S4,73:AKWVBK3WA3-S4,74:AKTY78466R-S4,75:AJMJLVAV36-S4,76:AKFM47UC8A-S4,77:AL3V9SF96T-S4,78:AL4Y3NSRXB-S4,79:AJBQDWWYWS-S4,80:ALWS38SSK3-S4,81:AJWA2XA8D2-S4,82:AM2P7KSKNC-S4,83:AKD47S7XWC-S4,84:AG65M7UDBY-S4,85:AGA5KF8P8R-S4,86:AFU2WTR7QX-S4,87:AHAQU32E5S-S4,88:AFVH229KSL-S4,89:AMTRKB97N6-S4,90:AN2X5BCL5V-S4,91:ANL2P67EHG-S4,92:AC2VV9GWKC-S4,93:,94:,95:,96:,97:,98:AKX9GNNFL4-S4,99:AJ9JNYNLEP-S4,100:'

// formatData(data)

// 编号列表搜索
searchBtn.addEventListener('click', function () {
  if (!dataListCatch) {
    return false
  }
  const arr = fuzzyQuery(dataListCatch.split(','), searchInput.value.trim())
  console.log(arr)
  if (arr.length > 0) {
    formatSearchData(arr)
  } else {
    list.innerHTML = '<div id="empty">查询不到编号内容，请重置查询条件后重新尝试</div>'
  }
})

// 编号列表重置
searchReset.addEventListener('click', function () {
  searchInput.value = ''
  if (!dataListCatch) {
    return false
  }
  formatData(dataListCatch)
})

// 模糊查询
function fuzzyQuery(list, keyWord) {
  var arr = []
  for (var i = 0; i < list.length; i++) {
    if (list[i].indexOf(keyWord.toUpperCase()) >= 0) {
      arr.push(list[i])
    }
  }
  return arr
}
