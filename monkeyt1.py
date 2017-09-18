# coding:utf-8
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import sys
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

FIRST_OFFICIAL_ACCOUNT_X = 381
FIRST_OFFICIAL_ACCOUNT_Y = 221




# Process a single file for the specified device.
def process_file(fp, device):
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
    device.touch(SEARCH_BUTTEN_X, SEARCH_BUTTEN_Y, "downAndUp")
    MonkeyRunner.sleep(1.5)
    device.touch(OFFICIAL_ACCOUNT_BUTTEN_X, OFFICIAL_ACCOUNT_BUTTEN_Y, "downAndUp")
    MonkeyRunner.sleep(1.6)
    device.touch(SEARCH_ICON_X, SEARCH_ICON_Y, "downAndUp")
    MonkeyRunner.sleep(0.4)
    device.type('魔天记')
    MonkeyRunner.sleep(0.5)
    device.press("KEYCODE_ENTER", "downAndUp")
    MonkeyRunner.sleep(4)
    device.touch(FIRST_OFFICIAL_ACCOUNT_X, FIRST_OFFICIAL_ACCOUNT_Y, "downAndUp")


def main():
    file = sys.argv[1]
    fp = open(file, "r")
    device = MonkeyRunner.waitForConnection()

    process_file(fp, device)
    fp.close()



if __name__ == '__main__':
    main()