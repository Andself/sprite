const DefaultConfig = {
  column: 5,
  size: 128,
  padding: 0
}

const filesList = []
const filelistDOM = document.getElementById('filelist')
const fileCount = document.getElementById('fileCount')
const removeAllButton = document.getElementById('removeAll')
const filePool = document.getElementById('addfile')

function handleFile (e) {
  Array.from(e.target.files).forEach((e, i) => {
    readerFile(e).then(res => {
      filesList.push(res)
      console.log('读取完成：' + res.name)
      drawFileList(res.name, res.hash)
    })
  })
  resetfilePool()
}

function makeCanvas (config, files) {
  const canvasWarp = document.createElement('div')
  canvasWarp.className = 'outputIMGWarp'
  const canvasWarpButtons = document.createElement('div')
  canvasWarpButtons.className = 'outputIMGWarpButtons'
  const downloadLink = document.createElement('a')
  downloadLink.innerText = '下载'
  downloadLink.className = 'download-link'
  const outputArrayString = drawArrayStringDOM(files)
  const canvasDom = document.createElement('canvas')
  canvasDom.className = 'outputIMG'
  canvasDom.width = config.size * config.column
  canvasDom.height = ((files.length / config.column) << 0) === (files.length / config.column) ? (files.length / config.column) * config.size : (((files.length / config.column) + 1) << 0) * config.size
  canvasWarpButtons.appendChild(downloadLink)
  canvasWarp.appendChild(canvasWarpButtons)
  canvasWarp.appendChild(canvasDom)
  canvasWarp.appendChild(outputArrayString)
  document.getElementById('area').appendChild(canvasWarp)

  downloadLink.addEventListener('click', function(ev) {
    downloadLink.href = canvasDom.toDataURL()
    downloadLink.download = "sprite.png"
  }, false)

  drawIMG(canvasDom, files, config)
}

function drawIMG (canvas, files, config) {
  const {size, column, padding} = config
  const context2D = canvas.getContext('2d')

  const imgRealSize = size - padding * 2

  files.forEach((e, i) => {
    context2D.drawImage(e.file, ((i % column) * size) + padding, ((i - i % column) / column * size) + padding, imgRealSize, imgRealSize)
  })
}

function readerFile (file) {
  return new Promise((resolve) => {
    let reader = new FileReader()
    let img = new Image()
    reader.readAsDataURL(file)
    reader.addEventListener('load', () => {
      img.src = reader.result
      resolve({name: file.name, file: img, hash: file.name + (Date.now())})
    }, false)
  })
}

function start () {
  if (!filesList.length) {
    alert('先添加图片素材')
    return
  }
  updateConfig()
  makeCanvas(DefaultConfig, filesList)
}

function updateConfig () {
  Array.from(document.forms.config).forEach(e => {
    DefaultConfig[e.name] = e.value - 0
  })
}

document.getElementById('start').addEventListener('click', start)
document.getElementById('addfile').addEventListener('change', handleFile)
removeAllButton.addEventListener('click', removeAllFile)

/* 一些DOM操作 */
function extractName (name) {
  return name.match(/^[^\.]+/)[0]
}

function drawArrayStringDOM (files) {
  const outputArrayString = document.createElement('div')
  outputArrayString.innerHTML = `
  <div class="outputArrayString">
    <pre>
[
${files.map(e => '  \'' + extractName(e.name) + '\'').join(',\n')}
]
    </pre>
  </div>
  `
  return outputArrayString
}

function drawFileList (name, hash) {
  const li = document.createElement('li')
  li.innerText = name
  li.className = 'file-item'
  let hashData = document.createAttribute('data-hash')
  hashData.nodeValue = hash
  li.setAttributeNode(hashData)

  filelistDOM.appendChild(li)
  updateCount()
}

function updateCount () {
  const show = Boolean(filesList.length)
  fileCount.innerText = show ? '(' + filesList.length + ')' : ''
  removeAllButton.classList.toggle('hidden', !show)
}

function removeFileItem (target) {
  const name = target.innerText
  const hash = target.dataset.hash
  if (confirm('你确定要删除' + name + '吗？')) {
    let index = filesList.indexOf(filesList.find(e => e.hash === hash))
    filesList.splice(index, 1)
    console.log(target)
    filelistDOM.removeChild(target)
    updateCount()
  }
}

function removeAllFile () {
  if (confirm('你确定要清空列表吗？')) {
    filesList.splice(0)
    while (filelistDOM.firstChild) {
      filelistDOM.removeChild(filelistDOM.firstChild);
    }
    resetfilePool()
    updateCount()
  }
}

function resetfilePool () {
  filePool.value = ''
}

filelistDOM.addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    removeFileItem(event.target)
  }
})