#!-*- coding: utf-8 -*-
#!/bin/env python
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import os, sys

current_dir = os.path.dirname(os.path.abspath(__file__))
test_text = u"test: eng 123 黑色"
sys.path.append(current_dir)
import utils

print("install 'Input Unicode' apk")
utils.run_cmd("adb install -r %s"%
        os.path.join(current_dir, "Input Unicode.apk"))
print("input raw 'unicode' characters")
utils.get_encoded_character(test_text)
print("Now, verify if encoded characters are in clipboard")

