export const FIXED_RUNTIME_VERSION_FORMAT =
  '{"client":{{json .Client.Version}},"server":{{json .Server.Version}}}' as const;

export const FIXED_BASE_IMAGE_INSPECT_FORMAT =
  '{"architecture":{{json .Architecture}},"id":{{json .Id}},"os":{{json .Os}},"repoDigests":{{json .RepoDigests}}}' as const;

export const FIXED_BASE_ENVIRONMENT_KEYS_FORMAT =
  '{"architecture":{{json .Architecture}},"environmentKeys":[{{range $index, $entry := .Config.Env}}{{if $index}},{{end}}{{if lt (len (split $entry "=")) 2}}{{json "M4_INVALID_ENV_ENTRY"}}{{else}}{{json (index (split $entry "=") 0)}}{{end}}{{end}}],"id":{{json .Id}},"os":{{json .Os}},"repoDigests":{{json .RepoDigests}}}' as const;

export const FIXED_IMAGE_ID_FORMAT = "{{json .Id}}" as const;

export const FIXED_INSPECT_FORMAT =
  '{"image":{{json .Image}},"path":{{json .Path}},"args":{{json .Args}},"user":{{json .Config.User}},"env":{{json .Config.Env}},"workingDir":{{json .Config.WorkingDir}},"readOnlyRoot":{{json .HostConfig.ReadonlyRootfs}},"networkMode":{{json .HostConfig.NetworkMode}},"privileged":{{json .HostConfig.Privileged}},"pidMode":{{json .HostConfig.PidMode}},"ipcMode":{{json .HostConfig.IpcMode}},"utsMode":{{json .HostConfig.UTSMode}},"cgroupnsMode":{{json .HostConfig.CgroupnsMode}},"usernsMode":{{json .HostConfig.UsernsMode}},"runtime":{{json .HostConfig.Runtime}},"capAdd":{{json .HostConfig.CapAdd}},"capDrop":{{json .HostConfig.CapDrop}},"securityOptions":{{json .HostConfig.SecurityOpt}},"groupAdd":{{json .HostConfig.GroupAdd}},"binds":{{json .HostConfig.Binds}},"devices":{{json .HostConfig.Devices}},"deviceRequests":{{json .HostConfig.DeviceRequests}},"deviceCgroupRules":{{json .HostConfig.DeviceCgroupRules}},"portBindings":{{json .HostConfig.PortBindings}},"publishAllPorts":{{json .HostConfig.PublishAllPorts}},"logType":{{json .HostConfig.LogConfig.Type}},"logConfig":{{json .HostConfig.LogConfig.Config}},"memory":{{json .HostConfig.Memory}},"nanoCpus":{{json .HostConfig.NanoCpus}},"pids":{{json .HostConfig.PidsLimit}},"oomKillDisable":{{json .HostConfig.OomKillDisable}},"restartName":{{json .HostConfig.RestartPolicy.Name}},"restartRetries":{{json .HostConfig.RestartPolicy.MaximumRetryCount}},"mounts":{{json .Mounts}},"running":{{json .State.Running}},"status":{{json .State.Status}}}' as const;

export const FIXED_DOCKER_FORMATS = Object.freeze([
  FIXED_RUNTIME_VERSION_FORMAT,
  FIXED_BASE_IMAGE_INSPECT_FORMAT,
  FIXED_BASE_ENVIRONMENT_KEYS_FORMAT,
  FIXED_IMAGE_ID_FORMAT,
  FIXED_INSPECT_FORMAT,
] as const);
