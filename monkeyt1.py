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

RESET_BUTTEN_X = ''
RESET_BUTTEN_Y = ''

SEARCH_BUTTEN_X = 580
SEARCH_BUTTEN_Y = 80

OFFICIAL_ACCOUNT_BUTTEN_X = 575
OFFICIAL_ACCOUNT_BUTTEN_Y = 275

SEARCH_ICON_X = 159
SEARCH_ICON_Y = 71

FIRST_OFFICIAL_ACCOUNT_BUTTEN_X = 381
FIRST_OFFICIAL_ACCOUNT_BUTTEN_Y = 221


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

    test_text = u"北大"
    # 切换至原生输入法
    utils.run_cmd("adb shell settings put secure default_input_method com.example.android.softkeyboard/.SoftKeyboard")
    MonkeyRunner.sleep(2)
    # 若删去这条语句 可能导致输入的前几个字符丢失 原因未知
    print("install 'Input Unicode' apk")
    utils.run_cmd("adb install -r %s" %
                  os.path.join(current_dir, "Input Unicode.apk"))
    utils.get_encoded_character(test_text)
    MonkeyRunner.sleep(3)
    device.touch(365, 237, "downAndUp")

    MonkeyRunner.sleep(2)
    device.touch(SEARCH_BUTTEN_X, SEARCH_BUTTEN_Y, "downAndUp")
    MonkeyRunner.sleep(2)
    device.touch(OFFICIAL_ACCOUNT_BUTTEN_X, OFFICIAL_ACCOUNT_BUTTEN_Y, "downAndUp")
    MonkeyRunner.sleep(1.6)
    device.touch(SEARCH_ICON_X, SEARCH_ICON_Y, "downAndUp")
    MonkeyRunner.sleep(0.4)

    utils.run_cmd("adb shell settings put secure default_input_method com.baidu.input/.ImeService")
    MonkeyRunner.sleep(1)
    device.touch(457, 755, "downAndUp")
    MonkeyRunner.sleep(1)
    device.touch(450, 1175, "downAndUp")

    MonkeyRunner.sleep(0.5)
  #  device.press("KEYCODE_ENTER", "downAndUp")
    device.touch(660, 1146, "downAndUp")
    MonkeyRunner.sleep(4)
    device.touch(FIRST_OFFICIAL_ACCOUNT_BUTTEN_X, FIRST_OFFICIAL_ACCOUNT_BUTTEN_Y, "downAndUp")


def main():
    #file = sys.argv[1]
   # fp = open(file, "r")
    device = MonkeyRunner.waitForConnection()
    fp = 1
    process_file(fp, device)
   # fp.close()



if __name__ == '__main__':
    main()