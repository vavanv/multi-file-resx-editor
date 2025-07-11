import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { ResxData, ResxEntry } from '../types/resx';

const parseOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  ignoreNameSpace: false,
  removeNSPrefix: false,
  parseAttributeValue: false,
  parseTagValue: false,
  parseTrueNumberOnly: false,
  arrayMode: false,
  stopNodes: ['*.#text'],
};

const buildOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressBooleanAttributes: false,
};

export function parseResxFile(xmlContent: string): ResxData {
  const parser = new XMLParser(parseOptions);
  const parsed = parser.parse(xmlContent);

  const entries: ResxEntry[] = [];

  if (parsed.root && parsed.root.data) {
    const dataArray = Array.isArray(parsed.root.data) ? parsed.root.data : [parsed.root.data];

    dataArray.forEach((dataItem: any) => {
      if (dataItem.name) {
        const entry: ResxEntry = {
          name: dataItem.name,
          value: dataItem.value || '',
          comment: dataItem.comment || '',
        };
        entries.push(entry);
      }
    });
  }

  return { entries };
}

export function buildResxFile(data: ResxData): string {
  // Build RESX file manually to ensure proper format
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<root>\n';

  // Add schema definition
  xml +=
    '  <xsd:schema id="root" xmlns="" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:msdata="urn:schemas-microsoft-com:xml-msdata">\n';
  xml += '    <xsd:import namespace="http://www.w3.org/XML/1998/namespace" />\n';
  xml += '    <xsd:element name="root" msdata:IsDataSet="true">\n';
  xml += '      <xsd:complexType>\n';
  xml += '        <xsd:choice maxOccurs="unbounded">\n';
  xml += '          <xsd:element name="metadata">\n';
  xml += '            <xsd:complexType>\n';
  xml += '              <xsd:sequence>\n';
  xml += '                <xsd:element name="value" type="xsd:string" minOccurs="0" />\n';
  xml += '              </xsd:sequence>\n';
  xml += '              <xsd:attribute name="name" use="required" type="xsd:string" />\n';
  xml += '              <xsd:attribute name="type" type="xsd:string" />\n';
  xml += '              <xsd:attribute name="mimetype" type="xsd:string" />\n';
  xml += '              <xsd:attribute ref="xml:space" />\n';
  xml += '            </xsd:complexType>\n';
  xml += '          </xsd:element>\n';
  xml += '          <xsd:element name="assembly">\n';
  xml += '            <xsd:complexType>\n';
  xml += '              <xsd:attribute name="alias" type="xsd:string" />\n';
  xml += '              <xsd:attribute name="name" type="xsd:string" />\n';
  xml += '            </xsd:complexType>\n';
  xml += '          </xsd:element>\n';
  xml += '          <xsd:element name="data">\n';
  xml += '            <xsd:complexType>\n';
  xml += '              <xsd:sequence>\n';
  xml += '                <xsd:element name="value" type="xsd:string" minOccurs="0" />\n';
  xml += '                <xsd:element name="comment" type="xsd:string" minOccurs="0" />\n';
  xml += '              </xsd:sequence>\n';
  xml += '              <xsd:attribute name="name" use="required" type="xsd:string" />\n';
  xml += '              <xsd:attribute name="type" type="xsd:string" />\n';
  xml += '              <xsd:attribute name="mimetype" type="xsd:string" />\n';
  xml += '              <xsd:attribute ref="xml:space" />\n';
  xml += '            </xsd:complexType>\n';
  xml += '          </xsd:element>\n';
  xml += '          <xsd:element name="resheader">\n';
  xml += '            <xsd:complexType>\n';
  xml += '              <xsd:sequence>\n';
  xml += '                <xsd:element name="value" type="xsd:string" minOccurs="0" />\n';
  xml += '              </xsd:sequence>\n';
  xml += '              <xsd:attribute name="name" use="required" type="xsd:string" />\n';
  xml += '            </xsd:complexType>\n';
  xml += '          </xsd:element>\n';
  xml += '        </xsd:choice>\n';
  xml += '      </xsd:complexType>\n';
  xml += '    </xsd:element>\n';
  xml += '  </xsd:schema>\n';

  // Add required resheader elements
  xml += '  <resheader name="resmimetype">\n';
  xml += '    <value>text/microsoft-resx</value>\n';
  xml += '  </resheader>\n';
  xml += '  <resheader name="version">\n';
  xml += '    <value>2.0</value>\n';
  xml += '  </resheader>\n';
  xml += '  <resheader name="reader">\n';
  xml +=
    '    <value>System.Resources.ResXResourceReader, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>\n';
  xml += '  </resheader>\n';
  xml += '  <resheader name="writer">\n';
  xml +=
    '    <value>System.Resources.ResXResourceWriter, System.Windows.Forms, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089</value>\n';
  xml += '  </resheader>\n';

  // Add data entries
  data.entries.forEach(entry => {
    xml += `  <data name="${escapeXml(entry.name)}" xml:space="preserve">\n`;
    xml += `    <value>${escapeXml(entry.value)}</value>\n`;
    if (entry.comment) {
      xml += `    <comment>${escapeXml(entry.comment)}</comment>\n`;
    }
    xml += '  </data>\n';
  });

  xml += '</root>';

  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
