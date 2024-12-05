const fs = require('fs');
var time = 24

init = () => {
    try {
        // 默认配置
        if (!isExist('config.json')) {
            createFile({
                content: `{
            "del": {
                "path": [],
                "format": [".ts"],
                "time": 1
                }
            }`,
                fileName: "config.json"
            });
        }
        if (!isExist('err.txt')) {
            createFile({
                content: '',
                fileName: 'err.txt'
            });
        }
        if (!isExist('log.txt')) {
            createFile({
                content: '',
                fileName: 'log.txt'
            });
        }


        // 读取文件
        const str = fs.readFileSync('config.json', 'utf8');
        const { del } = JSON.parse(str)
        if (del.time || del.time == 0) {
            time = del.time
        }
        if (del.path.length == 0) {
            writeFile({
                content: 'config.del.path中配置文件路径',
                fileName: 'err.txt'
            });
            return;
        }
        if (del.format.length == 0) {
            writeFile({
                content: 'config.del.format中配置文件格式',
                fileName: 'err.txt'
            });
            return;
        }
        for (let i = 0; i < del.path.length; i++) {
            getFiles(del.path[i], del.format, delFile);
        }
    } catch (error) {
        writeFile({
            content: error,
            fileName: 'err.txt'
        });
    }
}
// 判断文件是否存在
isExist = (path) => {
    // 同步判断文件是否存在
    return fs.existsSync(path);
}
delFile = (path, files) => {
    if (files.length == 0) {
        return;
    }
    for (let i = 0; i < files.length; i++) {
        const filePath = path + "/" + files[i];
        const fileInfo = getFileInfo(filePath);
        const fileDate = fileInfo.birthtime.getTime();
        const now = new Date().getTime();
        // 配置文件删除时间
        const delTime = Number(time) * (60 * 60 * 1000);
        console.log(delTime);

        writeFile({
            content: 'delTime' + delTime + ' now - fileDate' + (now - fileDate),
            fileName: 'log.txt'
        })
        // 根据time的时间保留文件
        if (now - fileDate > delTime) {
            // 同步删除文件
            const state = fs.unlinkSync(filePath);

            if (state) {
                writeFile({
                    content: filePath + ' 删除失败',
                    fileName: 'err.txt'
                });
                return
            }
            writeFile({
                content: filePath + ' 删除成功',
                fileName: 'log.txt'
            })
        }
    }
}
// 获取文件
getFiles = (path, format, callback) => {
    for (let i = 0; i < format.length; i++) {
        // 同步获取 format[i] 格式的文件
        const files = fs.readdirSync(path).filter(file => file.endsWith(format[i]));
        console.log(files);

        callback(path, files);
    }
}
getFileInfo = (path) => {
    // 同步获取文件信息
    return fs.statSync(path);
}
// 创建文件
createFile = ({ fileName, content }) => {
    // 同步创建文件
    fs.writeFileSync(fileName, content);
}
// 写入
writeFile = ({ fileName, content }) => {
    if (isExist(fileName)) {
        const text = new Date().toLocaleString('zh') + ' ' + content + '\n';

        // 文件末尾追加内容
        fs.appendFile(fileName, text, (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

}

init()


