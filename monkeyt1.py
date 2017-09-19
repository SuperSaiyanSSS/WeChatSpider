# -*- coding: utf-8 -*-
import sys
import os
reload(sys)
sys.setdefaultencoding('utf-8')
sys.path.append("G:\\wechat\\pyt1")
import subprocess as SP
import sys
import utils

from com.android.monkeyrunner import MonkeyRunner

CMD_MAP = {
    "TOUCH": lambda dev, arg: dev.touch(**arg),
    "DRAG": lambda dev, arg: dev.drag(**arg),
    "PRESS": lambda dev, arg: dev.press(**arg),
    "TYPE": lambda dev, arg: dev.type(**arg),
    "WAIT": lambda dev, arg: MonkeyRunner.sleep(**arg)
}

# 复制并退出mainAPP按钮
APP_QUIT_BUTTON_X = 365
APP_QUIT_BUTTON_Y = 237


# 微信左上角X按钮
RESET_BUTTON_X = ''
RESET_BUTTON_Y = ''

# 微信右上角搜索图标按钮
SEARCH_BUTTON_X = 580
SEARCH_BUTTON_Y = 80

# 百度输入法<I>按钮
BAIDU_I_BUTTON_X = 457
BAIDU_I_BUTTON_Y = 755

# 百度输入法粘贴按钮
BAIDU_PASTE_X = 450
BAIDU_PASTE_Y = 1175

# 百度输入法搜索按钮
BAIDU_SEARCH_X = 660
BAIDU_SEARCH_Y = 1146

# 微信公众号按钮
OFFICIAL_ACCOUNT_BUTTON_X = 575
OFFICIAL_ACCOUNT_BUTTON_Y = 275

# 微信搜索框。点击使光标停留在此处
SEARCH_ICON_X = 159
SEARCH_ICON_Y = 71

# 微信搜索获取的第一个公众号（即目标公众号）
FIRST_OFFICIAL_ACCOUNT_BUTTON_X = 381
FIRST_OFFICIAL_ACCOUNT_BUTTON_Y = 221


current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)


def run_cmd(cmd, with_error = False):
    try:
        output, error = SP.Popen(cmd, stdout=SP.PIPE, stderr = SP.PIPE, shell = True).communicate()
        if with_error:
            return output.lower(), error.lower()
        return output.strip().lower() if not error else ""
    except ValueError, error:
        print("Error: %s occurs while running %s"%error, cmd)
    except OSError, err:
        print(err)


# Process a single file for the specified device.
def process_file(fp, device):
    """
    adb shell settings put secure default_input_method com.baidu.input/.ImeService
    :param fp:
    :param device:
    :return:
    """
    # for line in fp:
    #     (cmd, rest) = line.split("|")
    #     try:
    #         rest = eval(rest)
    #     except:
    #         print ("unable to parse options")
    #         continue
    #
    #     if cmd not in CMD_MAP:
    #         print ("unknown command: " + cmd)
    #         continue
    #
    #     CMD_MAP[cmd](device, rest)
    #     device.press("KEYCODE_ENTER", "downAndUp")

    test_text = u"微电子"
    # 切换至原生输入法
    utils.run_cmd("adb shell settings put secure default_input_method com.example.android.softkeyboard/.SoftKeyboard")
    MonkeyRunner.sleep(2)

    # 需要等待APP加载成功后再输入，否则容易丢失前面几个字符
    utils.run_cmd("adb shell am start -an com.symbio.input.unicode/.Main")
    MonkeyRunner.sleep(8)

    os.system("adb shell input text %r" % u"地下城与勇士")
    MonkeyRunner.sleep(3)
    # 退出中转APP
    device.touch(APP_QUIT_BUTTON_X, APP_QUIT_BUTTON_Y, "downAndUp")

    MonkeyRunner.sleep(2)
    device.touch(SEARCH_BUTTON_X, SEARCH_BUTTON_Y, "downAndUp")
    MonkeyRunner.sleep(2)
    device.touch(OFFICIAL_ACCOUNT_BUTTON_X, OFFICIAL_ACCOUNT_BUTTON_Y, "downAndUp")
    MonkeyRunner.sleep(1.6)
    device.touch(SEARCH_ICON_X, SEARCH_ICON_Y, "downAndUp")
    MonkeyRunner.sleep(0.4)

    utils.run_cmd("adb shell settings put secure default_input_method com.baidu.input/.ImeService")
    MonkeyRunner.sleep(1)
    # I（工具）按钮
    device.touch(BAIDU_I_BUTTON_X, BAIDU_I_BUTTON_Y, "downAndUp")
    MonkeyRunner.sleep(1)
    # 粘贴
    device.touch(BAIDU_PASTE_X, BAIDU_PASTE_Y, "downAndUp")
    MonkeyRunner.sleep(0.5)
    # 搜索
    device.touch(BAIDU_SEARCH_X, BAIDU_SEARCH_Y, "downAndUp")
    MonkeyRunner.sleep(4)
   # device = MonkeyRunner.waitForConnection()
    device.touch(FIRST_OFFICIAL_ACCOUNT_BUTTON_X, FIRST_OFFICIAL_ACCOUNT_BUTTON_Y, "downAndUp")
    MonkeyRunner.sleep(3)

    # 从最下面开始 依次向上点击 以关注公众号
    # 因为不同的公众号“关注”按钮的位置不同
    # 若自上向下点 则很可能会点到“历史消息”等按钮，导致失败
    upY = 1149
    while upY >= 579:
       # device = MonkeyRunner.waitForConnection()
        device.touch(660, upY, "downAndUp")
        upY -= 50
        MonkeyRunner.sleep(2)

    device.touch(677, 74, "downAndUp")
    MonkeyRunner.sleep(3)

    downY = 500
    while upY <= 900:
       # device = MonkeyRunner.waitForConnection()
        device.touch(64, upY, "downAndUp")
        upY += 50
        MonkeyRunner.sleep(2)

def main():
    #file = sys.argv[1]
   # fp = open(file, "r")
    device = MonkeyRunner.waitForConnection()
    fp = 1
    process_file(fp, device)
   # fp.close()



if __name__ == '__main__':
    main()