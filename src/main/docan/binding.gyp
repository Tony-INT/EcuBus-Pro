{
    'targets': [
        {   
            'target_name': 'peak',
            'include_dirs': [
                './peak/inc',
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'configurations': {
                
            },
            'defines': [
               '__EXCEPTIONS'
            ],
            'sources': [
                './peak/swig/peak_wrap.cxx', './peak/swig/tsfn.cxx', 
            ],
            'conditions': [
                ['OS=="win"', {
                    'cflags': [
                        
                    ],
                    'cflags_cc': [
                       
                    ],
                    'libraries': ['<(module_root_dir)/peak/lib/PCAN-ISO-TP.lib','<(module_root_dir)/peak/lib/PCANBasic.lib'],
                    'defines': [ 'DELAYLOAD_HOOK',],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                        'AdditionalOptions': [ '/DELAYLOAD:PCAN-ISO-TP.dll','/DELAYLOAD:PCANBasic.dll' ],
                        'ExceptionHandling':1
                        }
                    },
                    'link_settings': {
                        'libraries': [ '-DELAYLOAD:PCAN-ISO-TP.dll','-DELAYLOAD:PCANBasic.dll' ]
                    }
                }
                
                ]
            ],
        },
        {   
            'target_name': 'peakLin',
            'include_dirs': [
                './peak/inc',
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'configurations': {
                
            },
            'defines': [
               '__EXCEPTIONS'
            ],
            'sources': [
                './peak/swig/lin_wrap.cxx', './peak/swig/lifn.cxx', 
            ],
            'conditions': [
                ['OS=="win"', {
                    'cflags': [
                        
                    ],
                    'cflags_cc': [
                       
                    ],
                    'libraries': ['<(module_root_dir)/peak/lib/PLinApi.lib'],
                    'defines': [ 'DELAYLOAD_HOOK',],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                        'AdditionalOptions': [ '/DELAYLOAD:PLinApi.dll'],
                        'ExceptionHandling':1
                        }
                    },
                    'link_settings': {
                        'libraries': ['-DELAYLOAD:PLinApi.dll' ]
                    }
                }
                
                ]
            ],
        },
        {   
            'target_name': 'kvaser',
            'include_dirs': [
                './kvaser/inc',
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'configurations': {
                
            },
            'defines': [
               '__EXCEPTIONS'
            ],
            'sources': [
                './kvaser/swig/kvaser_wrap.cxx', './kvaser/swig/tsfn.cxx', 
            ],
            'conditions': [
                ['OS=="win"', {
                    'cflags': [
                        
                    ],
                    'cflags_cc': [
                       
                    ],
                    'libraries': ['<(module_root_dir)/kvaser/lib/canlib32.lib'],
                    'defines': [ 'DELAYLOAD_HOOK',],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                        'AdditionalOptions': [ '/DELAYLOAD:canlib32.dll'],
                        'ExceptionHandling':1
                        }
                    },
                    'link_settings': {
                        'libraries': [ '-DELAYLOAD:canlib32.dll']
                    }
                }
                
                ]
            ],
        },
        {   
            'target_name': 'zlg',
            'include_dirs': [
                './zlg/inc',
                "<!@(node -p \"require('node-addon-api').include\")"
            ],
            'configurations': {
                
            },
            'defines': [
               '__EXCEPTIONS'
            ],
            'sources': [
                './zlg/swig/zlg_wrap.cxx', './zlg/swig/tsfn.cxx', 
            ],
            'conditions': [
                ['OS=="win"', {
                    'cflags': [
                        
                    ],
                    'cflags_cc': [
                       
                    ],
                    'libraries': ['<(module_root_dir)/zlg/lib/zlgcan.lib'],
                    'defines': [ 'DELAYLOAD_HOOK',],
                    'msvs_settings': {
                        'VCCLCompilerTool': {
                        'AdditionalOptions': [ '/DELAYLOAD:zlgcan.dll','/DELAYLOAD:msvcp120.dll','/DELAYLOAD:msvcr120.dll'],
                        'ExceptionHandling':1
                        }
                    },
                    'link_settings': {
                        'libraries': [ '-DELAYLOAD:zlgcan.dll','-DELAYLOAD:msvcp120.dll','-DELAYLOAD:msvcr120.dll']
                    }
                }
                
                ]
            ],
        }
    ]
}