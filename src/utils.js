/**
 * @file
 * @author tanghao
 * @date 2019-06-19
 */
/* eslint-disable */
function circleSelect(ele, callback, fixParam) {
    function clearEventBubble(evt) {
        // stopPropagation()不再派发事件。终止事件在传播过程的捕获、目标处理或起跑阶段进一步传播
        if (evt.stopPropagation) evt.stopPropagation();
        else evt.cancelBubble = true; // 阻止该事件的进一步冒泡
        if (evt.preventDefault) evt.preventDefault();
        // 取消事件的默认动作
        else evt.returnValue = false;
    }
    ele.onmousedown = function(e) {
        if (e.target !== ele) {
            return false;
        }
        var selList = [];
        // getElementByTagName返回带有指定标签名的对象的集合
        var fileNodes = document.getElementsByTagName("div");
        for (var i = 0; i < fileNodes.length; i++) {
            // 返回数组中某个指定的元素位置
            if (fileNodes[i].className.indexOf("file-folder") != -1) {
                fileNodes[i].className = "file-folder";
                selList.push(fileNodes[i]);
            }
        }
        var isSelect = true;
        // 获取事件触发后的event对象，做了一个兼容性处理
        var evt = window.event || arguments[0];
        // 存放鼠标点击初始位置
        var startX = evt.x || evt.clientX;
        var startY = evt.y || evt.clientY;
        startX -= fixParam.x;
        startY -= fixParam.y;
        // 创建一个框选元素
        // startX = 0;
        // startY = 0;
        var selDiv = document.createElement("div");
        // 给框选元素添加CSS样式，使用决定定位
        selDiv.style.cssText =
            "position:absolute; width:0px; height:0px; font-size:0px; margin:0px; padding:0px; border:1px dashed #0099FF; z-index:1000; filter:alpha(opacity:60); opacity:0.6; display:none";
        // 添加ID
        selDiv.id = "selectDiv";
        // appendChild()向节点添加最后一个子节点
        // document.body.appendChild(selDiv);
        ele.appendChild(selDiv);
        // 根据起始位置，添加定位
        selDiv.style.left = startX + "px";
        selDiv.style.top = startY + "px";

        // 根据坐标给选框修改样式
        var _x = null;
        var _y = null;
        // clearEventBubble(evt);
        // 移动鼠标
        ele.onmousemove = function() {
            evt = window.event || arguments[0];
            if (isSelect) {
                if (selDiv.style.display == "none") {
                    selDiv.style.display = "";
                }
                // 获取当前鼠标位置
                _x = evt.x || evt.clientX;
                _y = evt.y || evt.clientY;
                _x -= fixParam.x;
                _y -= fixParam.y;
                selDiv.style.left = Math.min(_x, startX) + "px";
                selDiv.style.top = Math.min(_y, startY) + "px";
                selDiv.style.width = Math.abs(_x - startX) + "px"; //Math.abs()返回数的绝对值
                selDiv.style.height = Math.abs(_y - startY) + "px";

                // *******************************************************************************
                // 获取参数
                var _l = selDiv.offsetLeft;
                var _t = selDiv.offsetTop;
                var _w = selDiv.offsetWidth;
                var _h = selDiv.offsetHeight;
                for (var i = 0; i < selList.length; i++) {
                    var sl = selList[i].offsetWidth + selList[i].offsetLeft;
                    var st = selList[i].offsetHeight + selList[i].offsetTop;

                    if (
                        sl > _l &&
                        st > _t &&
                        selList[i].offsetLeft < _l + _w &&
                        selList[i].offsetTop < _t + _h
                    ) {
                        // 该DOM元素被选中，进行处理
                        // indexOf()可返回某个指定的字符串值在字符串中首次出现的位置
                        if (selList[i].className.indexOf(" selected") == -1) {
                            selList[i].className =
                                selList[i].className + " selected";
                        }
                    } else {
                        if (selList[i].className.indexOf(" selected") != -1) {
                            selList[i].className = "file-folder";
                        }
                    }
                }
            }
            clearEventBubble(evt);
        };

        // 放开鼠标，选框消失
        document.onmouseup = function() {
            ele.onmousemove = null;
            callback();
            isSelect = false;
            if (selDiv) {
                // document.body.removeChild(selDiv);
                ele.removeChild(selDiv);
            }

            (selList = null),
                (_x = null),
                (_y = null),
                (selDiv = null),
                (startX = null),
                (startY = null),
                (evt = null);
        };
    };
}

/**
 * 防抖函数
 * @param {*} func 防抖后要执行的回调
 * @param {*} wait 等待时间
 * @param {*} immediate
 */
function debounce(func, wait, immediate) {
    let timeout, lastArgs, context, timestamp, result;

    const later = function() {
        // 据上一次触发时间间隔
        const last = +new Date() - timestamp;

        // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
        if (last < wait && last > 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
            if (!immediate) {
                result = func.apply(context, lastArgs);
                if (!timeout) context = lastArgs = null;
            }
        }
    };

    return function(...args) {
        context = this;
        lastArgs = args;
        timestamp = +new Date();
        const callNow = immediate && !timeout;
        // 如果延时不存在，重新设定延时
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
}

// 获取当前日期
function getDate() {
    const myDate = new Date();
    let myArray = "";
    myArray += myDate.getFullYear() + ".";
    myArray +=
        myDate.getMonth() + 1 > 9
            ? myDate.getMonth() + 1 + "."
            : `0${myDate.getMonth() + 1}.`;
    myArray +=
        myDate.getDate() > 9 ? myDate.getDate() + " " : `0${myDate.getDate()} `;
    myArray +=
        myDate.getHours() > 9
            ? myDate.getHours() + ":"
            : `0${myDate.getHours()}:`;
    myArray +=
        myDate.getMinutes() > 9
            ? myDate.getMinutes()
            : `0${myDate.getMinutes()}`;

    return myArray;
}

// 获取当前日期,不包括时间
function formateTimeStamp(time) {
    const myDate = new Date(time * 1000);
    let myArray = "";
    myArray += myDate.getFullYear() + ".";
    myArray +=
        myDate.getMonth() + 1 > 9
            ? myDate.getMonth() + 1 + "."
            : `0${myDate.getMonth() + 1}.`;
    myArray +=
        myDate.getDate() > 9 ? myDate.getDate() + " " : `0${myDate.getDate()} `;

    return myArray;
}

// 转换文件体积
function formateFileSize(limit) {
    let size = "";
    if (limit < 1 * 1024) {
        // 小于0.1KB，则转化成B
        size = `${limit.toFixed(2)}B`;
    } else if (limit < 1 * 1024 * 1024) {
        // 小于0.1MB，则转化成KB
        size = `${(limit / 1024).toFixed(2)}KB`;
    } else if (limit < 1 * 1024 * 1024 * 1024) {
        // 小于0.1GB，则转化成MB
        size = `${(limit / (1024 * 1024)).toFixed(2)}MB`;
    } else {
        // 其他转化成GB
        size = `${(limit / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    }

    const sizeStr = `${size}`; // 转成字符串
    const index = sizeStr.indexOf("."); // 获取小数点处的索引
    const dou = sizeStr.substr(index + 1, 2); // 获取小数点后两位的值
    if (dou === "00") {
        // 判断后两位是否为00，如果是则删除00
        return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
    }
    return size;
}

// 获取文件后缀
function getSuffix(img_path) {
    const last_len = img_path.lastIndexOf(".") + 1;
    const len = img_path.length;
    const pathf = img_path.substring(last_len, len);
    return pathf.toLowerCase();
}

// 获取文件文件icon
function getFileIcon(row) {
    if (row.Suffix === "folder") {
        return "file";
    }
    // const imgPath = row.Name;
    // const lastLen = imgPath.lastIndexOf(".") + 1;
    // const len = imgPath.length;
    // const pathf = imgPath.substring(lastLen, len);
    const pathf = row.Suffix;
    const imgconf = {
        mp3: "mp3",
        mp4: "mp4",
        pdf: "pdf",
        ppt: "ppt",
        pptx: "ppt",
        rar: "rar",
        doc: "doc",
        docx: "doc",
        xls: "xls",
        xlsx: "xls",
        file: "file",
        png: "png",
        jpg: "png",
        gif: "png"
    };
    return pathf ? imgconf[pathf.toLowerCase()] || "other" : "other";
}

export {
    circleSelect,
    debounce,
    getDate,
    formateTimeStamp,
    formateFileSize,
    getSuffix,
    getFileIcon
};
