import React from 'react'
import Component from 'react-class'

import { Flex, Item } from 'react-flex'
import DateFormatInput from '../DateFormatInput'

import joinFunctions from '../joinFunctions'
import assignDefined from '../assignDefined'
import join from '../join'

export default class DateFormatSpinnerInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      focused: false
    }
  }

  componentWillUnmount() {
    this.started = false
  }

  render(){

    const props = this.props
    const children = React.Children.toArray(props.children)

    const input = this.inputChild = children.filter(c => c && c.type == 'input')[0]
    const inputProps = input ? assign({}, input.props) : {}

    const onChange = joinFunctions(props.onChange, inputProps.onChange)
    const disabled = props.disabled || inputProps.disabled

    assignDefined(inputProps, {
      minDate: props.minDate || inputProps.minDate,
      maxDate: props.maxDate || inputProps.maxDate,

      changeDelay: props.changeDelay === undefined ? inputProps.changeDelay : props.changeDelay,

      onChange,
      disabled,

      dateFormat: props.dateFormat === undefined ? inputProps.dateFormat : props.dateFormat,
      stopPropagation: props.stopPropagation,
      updateOnWheel: props.updateOnWheel,

      onBlur: this.onBlur,
      onFocus: this.onFocus
    })

    this.inputProps = inputProps

    const arrowSize = this.props.arrowSize

    this.arrows = {
      1: <svg height={arrowSize} viewBox="0 0 24 24" width={arrowSize} xmlns="http://www.w3.org/2000/svg">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        {/*<path d="M0 0h24v24H0z" fill="none"/>*/}
      </svg>,

      '-1': <svg height={arrowSize} viewBox="0 0 24 24" width={arrowSize} xmlns="http://www.w3.org/2000/svg">
        <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/>
        {/*<path d="M0-.75h24v24H0z" fill="none"/>*/}
      </svg>
    }

    const className = join(
      props.className,
      'react-date-picker__date-format-spinner',
      disabled && 'react-date-picker__date-format-spinner--disabled',
      this.isFocused() && 'react-date-picker__date-format-spinner--focused',
      `react-date-picker__date-format-spinner--theme-${props.theme}`
    )

    return <Flex
      inline
      row
      className={className}
      disabled={props.disabled}
    >
      <DateFormatInput
        ref={input => this.input = input }
        value={props.value}
        {...inputProps}
      />
      {this.renderArrows()}
    </Flex>
  }

  renderArrows(){
    if (this.props.renderArrows) {
      return this.props.renderArrows(this.props)
    }

    return <Flex
      column
      inline
    >
      {this.renderArrow(1)}
      {this.renderArrow(-1)}
    </Flex>
  }

  renderArrow(dir) {
    return <Item
      flexShrink={1}
      className="react-date-picker__date-format-spinner-arrow"
      style={{overflow: 'hidden', height: this.props.arrowSize}}
      onMouseDown={this.onMouseDown.bind(this, dir)}
      onMouseUp={this.onMouseUp}
      onMouseLeave={this.onMouseUp}
    >
      {this.arrows[dir]}
    </Item>
  }

  onMouseUp() {
    // global.removeEventListener('mouseup', this.onMouseUp)
    this.stop()
  }

  onMouseDown(dir, event) {
    if (this.props.disabled){
      event.preventDefault()
      return
    }

    // global.addEventListener('mouseup', this.onMouseUp, false)

    if (this.isFocused()) {
      event.preventDefault()
      this.start(dir)
    } else {
      this.focus()
      setTimeout(() => {
        this.start(dir)
      })
    }
  }

  start(dir) {
    this.started = true
    this.startTime = Date.now()

    this.step(dir)

    this.timeoutId = setTimeout(() => {
      this.step(dir)

      this.timeoutId = setTimeout(() => {
        const lazyStep = () => {
          const delay = this.props.stepDelay - ((Date.now() - this.startTime) / 500)
          this.step(dir, lazyStep, delay)
        }

        lazyStep()
      }, this.props.secondStepDelay)

    }, this.props.firstStepDelay)
  }

  isStarted() {
    return !!(this.started && this.input)
  }

  step(dir, callback, delay) {
    if (this.isStarted()) {
      this.input.onDirection(dir)

      if (typeof callback == 'function') {
        this.timeoutId = setTimeout(() => {
          if (this.isStarted()) {
            callback()
          }
        }, delay === undefined ? this.props.stepDelay : delay)
      }
    }
  }

  stop() {
    this.started = false
    if (this.timeoutId) {
      global.clearTimeout(this.timeoutId)
    }
  }

  focus(){
    if (this.input) {
      this.input.focus()
    }
  }

  isFocused() {
    return this.state.focused
  }

  onBlur(event) {
    const { props, inputProps } = this
    const onBlur = joinFunctions(props.onBlur, this.inputChild && this.inputChild.props && this.inputChild.props.onBlur)

    if (onBlur) {
      onBlur(event)
    }

    this.setState({
      focused: false
    })
  }

  onFocus() {
    const { props } = this
    const onFocus = joinFunctions(props.onFocus, this.inputChild && this.inputChild.props && this.inputChild.props.onFocus)

    if (onFocus) {
      onFocus(event)
    }

    this.setState({
      focused: true
    })
  }
}

DateFormatSpinnerInput.defaultProps = {
  firstStepDelay: 500,
  secondStepDelay: 250,
  stepDelay: 80,

  changeDelay: undefined,

  theme: 'default',

  disabled: false,
  arrowSize: 15,
  isDateInput: true,
  stopPropagation: true,
  updateOnWheel: true
}
