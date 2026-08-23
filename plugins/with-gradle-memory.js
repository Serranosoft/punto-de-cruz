const { withGradleProperties } = require('@expo/config-plugins');

const GRADLE_JVM_ARGS =
  '-Xmx2048m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8';

module.exports = function withGradleMemory(config) {
  return withGradleProperties(config, (gradleConfig) => {
    const properties = gradleConfig.modResults;
    const existingProperty = properties.find(
      (property) =>
        property.type === 'property' && property.key === 'org.gradle.jvmargs'
    );

    if (existingProperty) {
      existingProperty.value = GRADLE_JVM_ARGS;
    } else {
      properties.push({
        type: 'property',
        key: 'org.gradle.jvmargs',
        value: GRADLE_JVM_ARGS,
      });
    }

    return gradleConfig;
  });
};
